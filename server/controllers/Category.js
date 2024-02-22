const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find({});
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
    try {
            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            const selectedCategory = await Category.findById(categoryId)
                                            .populate({
                                                path: "courses",
                                                match: { status: "Published" },
                                                populate: "ratingAndReviews",
                                              })
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:"Category not found",
                });
            }
            // Handle the case when there are no courses
            if (selectedCategory.courses.length === 0) {
                console.log("No courses found for the selected category.")
                return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
                })
            }
            //get coursesfor different categories
            const categoriesExceptSelected = await Category.find({
                                         _id: {$ne: categoryId},
                                         })
            let differentCategory = await Category.findOne(
                                            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                                              ._id
                                          )
            .populate({
            path: "courses",
            match: { status: "Published" },
            })
            .exec()
            const allCategories = await Category.find()
                                            .populate({
                                              path: "courses",
                                              match: { status: "Published" },
                                              populate: {
                                                path: "instructor",
                                            },
                                            })
                                            .exec()
            const allCourses = allCategories.flatMap((category) => category.courses)
            const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategory,
                    mostSellingCourses
                },
            });

    }
    catch(error ) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Internal server error",
            error:error.message,
        });
    }
}








// const Category = require('../models/Category')

// exports.createCategory = async(req,res)=>{

// };

// exports.showAllCategories = async(req,res)=>{

// };

// //categoryPageDetails

// exports.CategoryPageDetails = async(req,res)=>{
//     try{

//         //get categoryId
//         const {categoryId} = req.body;

        
//         //get courses for specified courses id
//         const selectedCategory = await Category.findById(categoryId)
//                                                 .populate("courses")
//                                                 .exec();

//         //validation
//         if(!selectedCategory){
//             return res.status(404).json({
//                 success:false,
//                 message:"Data not found",
//             })
//         }

//         //get courses for different categories
//         const differentCategories = await Category.findById({_id:{$ne:categoryId}}).populate("courses").exec();

//         //get top selling courses -HW


//         //return response 
//         return res.status(200).json({
//             success:true,
//             data:{
//                 selectedCategory,
//                 differentCategories,
//                 topCourses
//             },
//         })

//     }
//     catch(error){
//         console.log(error)
//         return res.status(500).json({
//             success:false,
//             message:"Data not found",
//         })
//     }
// }