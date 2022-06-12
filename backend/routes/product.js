import express from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/product';
import { isAuth, isAdmin } from '../util';

const productRoute = express.Router();

//for search box to search for producrts, only tack ?text
productRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    //query is what after ?
    const category = req.query.category ? { category: req.query.category } : {};
    const searchKeyword = req.query.searchKeyword
      ? {
          name: {
            $regex: req.query.searchKeyword,
            $options: 'i',
          },
        }
      : {}; //search for empty value return all products
    const sortOrder = req.query.sortOrder
      ? req.query.sortOrder === 'lowest'
        ? { price: 1 }
        : { price: -1 }
      : { _id: -1 };
    const products = await Product.find({ ...category, ...searchKeyword }).sort(
      sortOrder
    );
    res.send(products);
  })
);

//return categories names exists in the database
productRoute.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

//find product pased on id
productRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found.' });
    }
  })
);

//update product data
productRoute.put(
  '/:id',
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      if (updatedProduct) {
        return res
          .status(200) //200 request has succeeded
          .send({ message: 'Product Updated', data: updatedProduct });
      }
    }
    return res.status(500).send({ message: ' Error in Updating Product.' });
  })
); //500 error messages aren't clear

//delete spesific product from product list
productRoute.delete(
  '/:id',
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const deletedProduct = await Product.findById(req.params.id);
    if (deletedProduct) {
      await deletedProduct.remove();
      res.send({ message: 'Product Deleted' });
    } else {
      res.send('Error in Deletion.');
    }
  })
);

//creating new product
productRoute.post(
  '/',
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const product = new Product({
      name: 'Sample Product',
      description: 'Sample Description',
      category: 'Sample Category',
      brand: 'Sample Brand',
      image: '/images/product-1.jpg',
    });
    const newProduct = await product.save();
    if (newProduct) {
      return res
        .status(201) //201 Created success status
        .send({ message: 'Product Created', data: newProduct });
    }
    return res.status(500).send({ message: ' Error in Creating Product.' });
  })
);

//create review and change the value in product rating and reviewNumber
productRoute.post(
  '/:id/reviews',
  isAuth,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const review = {
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user._id,
        name: req.user.name,
      };
      product.reviews.push(review);

      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      product.numReviews = product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Comment Created.',
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      throw Error('Product does not exist.');
    }
  })
);
export default productRoute;
