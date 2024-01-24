export const nearbyPipeline = (lgt, lat, distance) => ({
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
            Number.parseFloat(lgt), Number.parseFloat(lat),
        ],
      },
      distanceField: "dist.calculated",
      maxDistance: distance,
      query: {},
      includeLocs: "dist.location",
      spherical: true,
    },
});

export const projectPipeline = {
    $project: {
      image: "$garageImages.path",
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
            findNearby ? [nearbyPipeline(lgt, lat, Number.parseInt(distance))] : []
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
                                    $gte: minServicePrice, // lowest price
                                },
                            },
                            ...(maxServicePrice // if there is max price provided, add this pipeline
                                ? [
                                    {
                                      "services.highestPrice": {
                                        $lte: maxServicePrice, // max price
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
        //look up owner here ================

        // =================================
        projectPipeline
    ];

    return initialPipeline;
}