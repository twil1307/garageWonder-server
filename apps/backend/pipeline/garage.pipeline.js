import mongoose from "mongoose";
import { HOME_IMAGE_SIZE } from "../enum/garage.enum.js";
import { convertUrlPathWithSize } from "../helper/image.helper.js";

export const nearbyPipeline = (lgt, lat, distance) => ({
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
            Number.parseFloat(lgt), Number.parseFloat(lat),
        ],
      },
      distanceField: "dist.calculated",
      maxDistance: Number.parseFloat(distance),
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

export const mainPipeline = (garageName = '', serviceName = '', minServicePrice = 0, maxServicePrice = 0, findNearby = false, distance = 10000, lgt = 0, lat = 0) => { // default distance = 10km

    let initialPipeline = [
        ...(
            JSON.parse(findNearby) ? [nearbyPipeline(lgt, lat, distance)] : []
        ),  
        {
            $match: {
                name: new RegExp(garageName, "i"),
            },
        },
        {
            $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "services",
            },
        },
        {
            $unwind: "$services",
        },
        // filter by money range
        {
            $match: {
                $or: [
                    {
                        $and: [
                            {
                                "services.lowestPrice": {
                                    $gte: Number.parseFloat(minServicePrice), // lowest price
                                },
                            },
                            ...(maxServicePrice // if there is max price provided, add this pipeline
                                ? [
                                    {
                                      "services.highestPrice": {
                                        $lte: Number.parseFloat(maxServicePrice), // max price
                                      },
                                    },
                                  ]
                                : []),
                        ],
                    },
                    {
                        "services.name": new RegExp(serviceName, "i"),
                    },
                ],
            },
        },
        {
            $group: {
                _id: "$_id",
                garageItem: {
                    $first: "$$ROOT",
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ["$garageItem"],
                },
            },
        },
        {
            $lookup: {
                from: "images",
                localField: "images",
                foreignField: "_id",
                as: "garageImages",
            },
        },
        customPathTransformQuery(),
        //look up owner here ================

        // =================================
        projectPipeline
    ];

    return initialPipeline;
}

const customPathTransformQuery = (width = HOME_IMAGE_SIZE.width, height = HOME_IMAGE_SIZE.height) => {
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
    }
}

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
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "garageOwner",
          },
        },
        {
          $unwind: "$garageOwner"
        },
        {
          $lookup: {
            from: "users",
            localField: "staff",
            foreignField: "_id",
            as: "staff"
          }
        },
        {
            $unwind: "$staff",
          },
          {
            $group: {
              _id: {
                _id: "$_id",
                name: "$name",
                description: "$description",
                defaultSlot: "$defaultSlot",
                openAt: "$openAt",
                closeAt: "$closeAt",
                checkin: "$checkin",
                checkout: "$checkout",
                additionalFee: "$additionalFee",
                restrictCheckInDate:
                  "$restrictCheckInDate",
                rules: "$rules",
                rating: "$rating",
                location: "$location.coordinates",
                backgroundImage: "$backgroundImage",
                additionalServices: "$additionalServices",
                garageOwner: "$garageOwner",
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
              name: "$_id.name",
              description: "$_id.description",
              defaultSlot: "$_id.defaultSlot",
              openAt: "$_id.openAt",
              closeAt: "$_id.closeAt",
              checkin: "$_id.checkin",
              checkout: "$_id.checkout",
              additionalFee: "$_id.additionalFee",
              restrictCheckInDate: "$_id.restrictCheckInDate",
              rules: "$_id.rules",
              staff: "$_id.staff",
              rating: "$_id.rating",
              location: "$_id.location",
              backgroundImage: "$_id.backgroundImage",
              additionalServices: "$_id.additionalServices",
              garageOwner: "$_id.garageOwner",
              staff: 1
            },
        }
    ]   
};

export const getGarageServicePipeline = (garageId) => {
    return [
        {
          $match: {
            garageId: mongoose.Types.ObjectId(garageId),
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: "$category"
        },
        {
          $project: {
            __v: 0,
            garageId: 0,
            "category.createdAt": 0,
            "category.updatedAt": 0,
            "category.__v": 0,
          }
        }
    ]
}