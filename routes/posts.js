/**
 * Created by abhinav on 4/8/17.
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Post = require('../models/post');

var Posts = express.Router();
Posts.use(bodyParser.json());

Posts.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Post.find({}, function (err, post) {
            if (err) throw err;
            res.json(post);
        });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        Post.create(req.body, function (err, post) {
            if (err) throw err;
            console.log('Post created!');
            var id = post._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the post with id: ' + id);
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Post.remove({}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

Posts.route('/:postId')
    .get(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            res.json(post);
        });
    })

    .put(function (req, res, next) {
        Post.findByIdAndUpdate(req.params.postId, {
            $set: req.body
        }, {
            new: true
        }, function (err, post) {
            if (err) throw err;
            res.json(post);
        });
    })

    .delete(function (req, res, next) {
        Post.findByIdAndRemove(req.params.postId, function (err, resp) {        if (err) throw err;
            res.json(resp);
        });
    });
Posts.route('/:postId/comments')
    .get(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            res.json(post.comments);
        });
    })

    .post(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            post.comments.push(req.body);
            post.save(function (err, post) {
                if (err) throw err;
                console.log('Updated Comments!');
                res.json(post);
            });
        });
    })

    .delete(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            for (var i = (post.comments.length - 1); i >= 0; i--) {
                post.comments.id(post.comments[i]._id).remove();
            }
            post.save(function (err, result) {
                if (err) throw err;
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Deleted all comments!');
            });
        });
    });

Posts.route('/:postId/comments/:commentId')
    .get(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            res.json(post.comments.id(req.params.commentId));
        });
    })

    .put(function (req, res, next) {
        // We delete the existing commment and insert the updated
        // comment as a new comment
        Post.findById(req.params.postId, function (err, post) {
            if (err) throw err;
            post.comments.id(req.params.commentId).remove();
            post.comments.push(req.body);
            post.save(function (err, post) {
                if (err) throw err;
                console.log('Updated Comments!');
                res.json(post);
            });
        });
    })

    .delete(function (req, res, next) {
        Post.findById(req.params.postId, function (err, post) {
            post.comments.id(req.params.commentId).remove();
            post.save(function (err, resp) {
                if (err) throw err;
                res.json(resp);
            });
        });
    });

module.exports = Posts;
