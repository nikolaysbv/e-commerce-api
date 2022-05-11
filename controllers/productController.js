const Product = require("../models/Product")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const path = require("path")

const getAllProducts = async (req, res) => {
  const products = await Product.find({})

  res.status(StatusCodes.OK).json({ products, count: products.length })
}

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params

  const product = await Product.findOne({ _id: productId }).populate("reviews")

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`)
  }

  res.status(StatusCodes.OK).json({ product })
}

const createProduct = async (req, res) => {
  // attach user to object sent to mongo
  req.body.user = req.user.userId

  const product = await Product.create(req.body)

  res.status(StatusCodes.CREATED).json({ product })
}

const updateProduct = async (req, res) => {
  const { id: productId } = req.params

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  })

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`)
  }

  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params

  const product = await Product.findOne({ _id: productId })

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`)
  }

  await product.remove()

  res.status(StatusCodes.OK).json({ msg: "Product removed!" })
}

const uploadImage = async (req, res) => {
  // check if file has been uploaded
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded")
  }

  const productImage = req.files.image

  // check if file is an image
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload image")
  }

  // check if size is not too big
  const maxSize = 1024 * 1024 * 10
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    )
  }

  // set up path to static folder and move image there
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  )
  await productImage.mv(imagePath)

  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` })
}

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
}
