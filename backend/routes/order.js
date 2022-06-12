import express from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/order';
import User from '../models/user';
import Product from '../models/product';
import { isAuth, isAdmin } from '../util';

const orderRoute = express.Router();

//set user information in order, this after we set type:shcema, and ref:'user'
orderRoute.get(
  '/',
  isAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user');
    res.send(orders);
  })
);

//search for all orders made by spesific user
orderRoute.get(
  '/mine',
  isAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

//mack aggregate for numbers from all collections based on id
orderRoute.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      // { $unwind: { path: '$orderItems' } },
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.send({ orders, users, dailyOrders, productCategories });
  })
);

//search for order based on id
orderRoute.get(
  '/:id',
  isAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id });
    if (order) {
      res.send(order);
    } else {
      res.status(404).send('Order Not Found.');
    }
  })
);

//delet an order
orderRoute.delete(
  '/:id',
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id });
    if (order) {
      const deletedOrder = await order.remove();
      res.send(deletedOrder);
    } else {
      res.status(404).send('Order Not Found.');
    }
  })
);

//creat order
orderRoute.post(
  '/',
  isAuth,
  asyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems,
      user: req.user._id,
      shipping: req.body.shipping,
      payment: req.body.payment,
      itemsPrice: req.body.itemsPrice,
      taxPrice: req.body.taxPrice,
      shippingPrice: req.body.shippingPrice,
      totalPrice: req.body.totalPrice,
    });
    const newOrderCreated = await newOrder.save();
    res
      .status(201) //201 Created success status
      .send({ message: 'New Order Created', data: newOrderCreated });
  })
);

//udate some data after pay for order like isPaid...
orderRoute.put(
  '/:id/pay',
  isAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.payment = {
        paymentMethod: 'paypal',
        paymentResult: {
          payerID: req.body.payerID,
          orderID: req.body.orderID,
          paymentID: req.body.paymentID,
        },
      };
      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid.', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found.' });
    }
  })
);

//update some data when product is deliverd
orderRoute.put(
  '/:id/deliver',
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.send({ message: 'Order Delivered.', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found.' });
    }
  })
);

export default orderRoute;
