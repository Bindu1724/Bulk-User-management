const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /api/users/bulk-create
 * Create multiple users at once using insertMany
 * Accepts JSON array of user objects
 */
router.post('/bulk-create', async (req, res, next) => {
  try {
    const users = Array.isArray(req.body) ? req.body : [req.body];

    // Validation: Check if body is an array
    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Request body must be an array of user objects'
      });
    }

    // Validation: Check if array is not empty
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Array cannot be empty'
      });
    }

    // Insert multiple users - MongoDB insertMany()
    const createdUsers = await User.insertMany(users, { ordered: false });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully created ${createdUsers.length} users`,
      data: createdUsers
    });
  } catch (error) {
    // Handle partial failures in insertMany
    if (error.name === 'BulkWriteError') {
      const inserted = error.result.insertedDocs || [];
      return res.status(207).json({
        success: false,
        statusCode: 207,
        message: 'Partial bulk create - some documents failed',
        insertedCount: inserted.length,
        failedCount: error.writeErrors.length,
        insertedDocs: inserted,
        errors: error.writeErrors.map((e) => ({
          index: e.index,
          errmsg: e.errmsg
        }))
      });
    }
    next(error);
  }
});

/**
 * PUT /api/users/bulk-update
 * Update multiple users at once using bulkWrite
 * Accepts JSON array with updateOne/updateMany/replaceOne operations
 */
router.put('/bulk-update', async (req, res, next) => {
  try {
    const operations = req.body;

    // Validation: Check if body is an array
    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Request body must be an array of update operations'
      });
    }

    // Validation: Check if array is not empty
    if (operations.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Operations array cannot be empty'
      });
    }

    // Transform operations to MongoDB bulkWrite format
    const bulkOps = operations.map((op) => {
      if (op.updateOne) {
        return {
          updateOne: {
            filter: op.updateOne.filter,
            update: {
              $set: {
                ...op.updateOne.update,
                updatedAt: new Date()
              }
            }
          }
        };
      }
      if (op.updateMany) {
        return {
          updateMany: {
            filter: op.updateMany.filter,
            update: {
              $set: {
                ...op.updateMany.update,
                updatedAt: new Date()
              }
            }
          }
        };
      }
      return op;
    });

    // Execute bulk write operations
    const result = await User.collection.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Bulk update completed successfully',
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
        deletedCount: result.deletedCount,
        insertedCount: result.insertedCount
      }
    });
  } catch (error) {
    // Handle partial failures in bulkWrite
    if (error.name === 'BulkWriteError') {
      return res.status(207).json({
        success: false,
        statusCode: 207,
        message: 'Partial bulk update - some operations failed',
        data: {
          matched: error.result.matchedCount,
          modified: error.result.modifiedCount,
          upserted: error.result.upsertedCount
        },
        errors: error.writeErrors
      });
    }
    next(error);
  }
});

/**
 * GET /api/users
 * Get all users with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: users,
      pagination: {
        currentPage: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
