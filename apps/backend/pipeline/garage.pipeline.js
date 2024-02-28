import mongoose, { mongo } from "mongoose";
import { DETAIL_IMAGE_SIZE, HOME_IMAGE_SIZE, ITEMS_PER_CURSOR } from "../enum/garage.enum.js";
import { convertUrlPathWithSize } from "../helper/image.helper.js";

export const nearbyPipeline = (lgt, lat, distance) => ({
  $geoNear: {
    near: {
      type: "Point",
      coordinates: [Number.parseFloat(lgt), Number.parseFloat(lat)],
    },
    distanceField: "dist.calculated",
    maxDistance: Number.parseFloat(distance * 1000), // km -> m
    query: {},
    includeLocs: "dist.location",
    spherical: true,
  },
});

export const projectPipeline = {
  $project: {
    //   images: "$garageImages.path",
    images: "$garageImagesPath",
    location: "$dist",
    address: {
      $concat: [
        "$streetNumber",
        " ",
        "$streetName",
        ", ",
        "$district",
        ", ",
        "$city",
        ", ",
        "$country",
      ],
    },
    description: "$description",
    price: {
      min: "$services.lowestPrice",
      max: "$services.highestPrice",
    },
  },
};

const getSortCondition = (sort) => {
  let sortCdt = null;
  switch (sort) {
    case "priceDesc":
      sortCdt = {
        "price.to": -1,
        name: 1 
      };

      break;
    case "priceAsc":
      sortCdt = {
        "price.from": 1,
        name: 1
      };

      break;
    case "latest":
      sortCdt = {
        createdAt: -1
      };

      break;
    case "oldest":
      sortCdt = {
        createdAt: 1
      };

      break;
    
    default:
      break;
  }

  return sortCdt;
}

export const mainPipeline = (
  garageName = "",
  priceRange = { from: 0 },
  ratings,
  brands,
  distance,
  lng,
  lat,
  additional = [],
  itemPerCursor,
  nextCursor,
  sort
) => {
  // default distance = 10km

  const additionalObjectId = additional.map((item) =>
    mongoose.Types.ObjectId(item)
  );

  let initialPipeline = [
    ...(distance && Number.parseInt(distance) > 0 && lng && lat
      ? [nearbyPipeline(lng, lat, distance)]
      : []),
    {
      $match: {
        name: new RegExp(garageName, "i"),
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services",
      },
    },
    {
      $unwind: "$services",
    },
    {
      $lookup: {
        from: "categories",
        localField: "services.categoryId",
        foreignField: "_id",
        as: "services.categories",
      },
    },
    {
      $unwind: "$services.categories",
    },
    // filter by money range
    {
      $match: {
        $and: [
          {
            $and: [
              {
                "services.lowestPrice": {
                  $gte: Number.parseFloat(priceRange.from), // lowest price
                },
              },
              ...(priceRange.to // if there is max price provided, add this pipeline
                ? [
                    {
                      "services.highestPrice": {
                        $lte: Number.parseFloat(priceRange.to), // max price
                      },
                    },
                  ]
                : []),
            ],
          },
          ...(
            Array.isArray(brands) && brands.length > 0 ? [{
              "services.brandIds":{
                $in: brands,
              }
            }] : []
          ),
        ],
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          name: "$name",
          userId: "$userId",
          description: "$description",
          address: "$address",
          openAt: "$openAt",
          closeAt: "$closeAt",
          checkIn: "$checkIn",
          checkOut: "$checkOut",
          images: "$images",
          reviews: "$reviews",
          vouchers: "$vouchers",
          restrictCheckInDate: "$restrictCheckInDate",
          additionalServices: "$additionalServices",
          dateSlot: "$dateSlot",
          rating: "$rating",
          location: "$location",
          backgroundImage: "$backgroundImage",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
        to: {
          $max: "$services.highestPrice",
        },
        from: {
          $min: "$services.lowestPrice",
        },
        services: {
          $push: {
            _id: "$services._id",
            lowestPrice: "$services.lowestPrice",
            highestPrice: "$services.highestPrice",
            brandIds: "$services.brandIds",
            categories: "$services.categories",
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$_id",
            {
              price: {
                from: "$from",
                to: "$to",
              },
              services: "$services",
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "images",
        localField: "images",
        foreignField: "_id",
        as: "images",
      },
    },
    // Join garage owner ===================================
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    ...(additional && additional.length > 0
      ? [
          {
            $match: {
              additionalServices: {
                $in: additionalObjectId,
              },
            },
          },
        ]
      : []),
      {
        $unwind: "$images",
      },
      {
        $match: {
          $and: [
            {
              "images.width": HOME_IMAGE_SIZE.width,
            },
            {
              "images.height": HOME_IMAGE_SIZE.height,
            },
          ],
        },
      },
      {
        $unwind: "$backgroundImage",
      },
      {
        $match: {
          $and: [
            {
              "backgroundImage.width": HOME_IMAGE_SIZE.width,
            },
            {
              "backgroundImage.height": HOME_IMAGE_SIZE.height,
            },
          ],
        }
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            name: "$name",
            owner: "$owner",
            description: "$description",
            address: "$address",
            rating: "$rating",
            location: "$location",
            backgroundImage: "$backgroundImage",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            price: "$price",
          },
          images: {
            $push: {
              _id: "$images._id",
              url: "$images.url",
              width: "$images.width",
              height: "$images.height",
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$_id",
              {
                images: "$images",
              },
            ],
          },
        },
      },
      {
        $project: {
          "location.type": 0,
          "backgroundImage._id": 0,
          "owner.email": 0,
          "owner.emailVerified": 0,
          "owner.isAnonymous": 0,
          "owner.role": 0,
          "owner.favoriteGarage": 0,
          "owner.__v": 0,
          "owner.phoneNumber": 0
        }
      },
    // sorting by createdAt
    ...(sort ? [{
      $sort: getSortCondition(sort),
    }] : [{
      $sort: {
        createdAt: 1
      }
    }]),
    //-------------------
    // pagination
    ...(nextCursor
      ? [
          {
            $match: {
              _id: {
                $gte: mongoose.Types.ObjectId(nextCursor),
              },
            },
          },
        ]
      : []),
    {
      $limit: (itemPerCursor || ITEMS_PER_CURSOR) + 1,
    },
  ];

  return initialPipeline;
};

const customPathTransformQuery = (
  width = HOME_IMAGE_SIZE.width,
  height = HOME_IMAGE_SIZE.height
) => {
  return {
    $addFields: {
      garageImagesPath: {
        $map: {
          input: "$garageImages",
          as: "img",
          in: {
            _id: "$$img._id",
            url: "$$img.path",
            width: width,
            height: height,
          },
        },
      },
    },
  };
};

export const getGarageBasicInfoPipeline = (garageId) => {
  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(garageId),
      },
    },
    {
      $lookup: {
        from: "additionalservices",
        localField: "additionalServices",
        foreignField: "_id",
        as: "additionalServices",
      },
    },
    {
      $unwind: "$backgroundImage",
    },
    {
      $match: {
        $and: [
          {
            "backgroundImage.width": DETAIL_IMAGE_SIZE.width,
          },
          {
            "backgroundImage.height": DETAIL_IMAGE_SIZE.height,
          },
        ],
      }
    },
    // join garage owner and staff =====================================
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "userId",
    //     foreignField: "_id",
    //     as: "garageOwner",
    //   },
    // },
    // {
    //   $unwind: "$garageOwner",
    // },
    {
      $lookup: {
        from: "users",
        localField: "staff",
        foreignField: "_id",
        as: "staff",
      },
    },
    {
      $unwind: "$staff",
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          userId: "$userId",
          name: "$name",
          status: "$status",
          description: "$description",
          defaultSlot: "$defaultSlot",
          dateSlot: "$dateSlot",
          rating: "$rating",
          openAt: "$openAt",
          closeAt: "$closeAt",
          vouchers: "$vouchers",
          additionalFee: "$additionalFee",
          restrictCheckInDate: "$restrictCheckInDate",
          rules: "$rules",
          rating: "$rating",
          location: "$location",
          address: "$address",
          backgroundImage: "$backgroundImage",
          additionalServices: "$additionalServices",
        },
        staff: {
          $push: {
            _id: "$staff._id",
            displayName: "$staff.displayName",
            photoURL: "$staff.photoURL",
          },
        },
      },
    },
    {
      $project: {
        _id: "$_id._id",
        userId: "$_id.userId",
        status: "$_id.status",
        name: "$_id.name",
        description: "$_id.description",
        defaultSlot: "$_id.defaultSlot",
        dateSlot: "$_id.dateSlot",
        openAt: "$_id.openAt",
        closeAt: "$_id.closeAt",
        defaultSlot: "$_id.defaultSlot",
        additionalFee: "$_id.additionalFee",
        restrictCheckInDate: "$_id.restrictCheckInDate",
        rules: "$_id.rules",
        staff: "$_id.staff",
        rating: "$_id.rating",
        location: "$_id.location",
        address: "$_id.address",
        backgroundImage: "$_id.backgroundImage",
        additionalServices: "$_id.additionalServices",
        garageOwner: "$_id.garageOwner",
        staff: 1,
      },
    },
    //=============================================================
    {
      $project: {
        "location.type": 0,
        "images": 0,
        "services": 0,
        "backgroundImage._id": 0,
        "categories": 0
      }
    }
  ];
};

export const getGarageServicePipeline = (garageId) => {
  return [
    {
      $match: {
        garageId: mongoose.Types.ObjectId(garageId),
      },
    },
    // {
    //   $lookup: {
    //     from: "categories",
    //     localField: "categoryId",
    //     foreignField: "_id",
    //     as: "category",
    //   },
    // },
    // {
    //   $unwind: "$category",
    // },
    {
      $project: {
        __v: 0,
        garageId: 0,
        "category.createdAt": 0,
        "category.updatedAt": 0,
        "category.__v": 0,
      },
    },
  ];
};
