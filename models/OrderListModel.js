const mongoose = require('mongoose');

let OrderListSchema = new mongoose.Schema({
    create_time: {
        type: Date,
        required: true
    },
    pay_method: {
        type: String,
        required: true
    },
    bill_amount: {
        type: Number,
        required: true
    },
    item_list: [
        {
            item: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ]
});

OrderListSchema.statics.getSalesStatsByItem = function (start, end) {
    let pipeline = [
        { $unwind: "$item_list" },
        {
            $group: {
                _id: "$item_list.item",
                total_sales: { $sum: "$item_list.amount" }
            }
        },
        { $sort: { total_sales: -1 } },
        { $project: { _id: 0, name: "$_id", total_sales: 1 } }
    ];

    // If start and end are provided, add a $match stage to the start of the pipeline
    if (start && end) {
        pipeline.unshift({
            $match: {
                create_time: {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
            }
        });
    }

    return this.aggregate(pipeline).exec();
};

let OrderListModel = mongoose.model('order_lists', OrderListSchema);

module.exports = OrderListModel;
