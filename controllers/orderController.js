const Order = require("../models/Order")
const Product = require("../models/Product")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const { checkPermissions } = require("../utils")

// fake Stripe API (in order not to use the real one)
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "somevalue"
  return { client_secret, amount }
}

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body

  // check if there are any items in the cart
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided")
  }

  // check if tax and shipping fee are provided
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Please provide tax and shipping fee")
  }

  let orderItems = []
  let subtotal = 0

  // iterate over the items in cart
  for (let item of cartItems) {
    // get item from db
    const dbProduct = await Product.findOne({ _id: item.product })

    // check if item exists in db
    if (!dbProduct) {
      throw new CustomError.BadRequestError(
        `No product with id: ${item.product}`
      )
    }

    // create final list of order items and calculate subtotal with values from db
    const { name, price, image, _id } = dbProduct
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    }

    orderItems = [...orderItems, singleOrderItem]
    subtotal += item.amount * price
  }

  // calculate total
  const total = tax + shippingFee + subtotal

  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  })

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})

  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })

  if (!order) {
    throw new CustomError.BadRequestError(`No order with id: ${orderId}`)
  }

  checkPermissions(req.user, order.user)

  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })

  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { paymentIntentId } = req.body
  const order = await Order.findOne({ _id: orderId })

  if (!order) {
    throw new CustomError.BadRequestError(`No order with id: ${orderId}`)
  }

  checkPermissions(req.user, order.user)

  order.paymentIntentId = paymentIntentId
  order.status = "paid"
  await order.save()

  res.status(StatusCodes.OK).json({ order })
}

module.exports = {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
}
