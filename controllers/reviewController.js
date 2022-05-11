const Product = require("../models/Product")
const Review = require("../models/Review")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const { checkPermissions } = require("../utils")

const getAllReviews = async (req, res) => {
  // get reviews and additional properties of products
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  })

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const createReview = async (req, res) => {
  // get product and check if it exists
  const { product: productId } = req.body
  const isValidProduct = await Product.findOne({ _id: productId })
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`)
  }

  // check if user has already submitted a review for this product
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted a review for this product"
    )
  }

  // attach user to object sent to mongo
  req.body.user = req.user.userId

  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
  }

  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { rating, title, comment } = req.body
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()

  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  await review.remove()

  res.status(StatusCodes.OK).json({ msg: "Review removed!" })
}

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
  getAllReviews,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
}
