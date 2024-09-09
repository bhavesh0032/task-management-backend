const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  console.log('Received task data:', req.body);
  console.log('User ID from auth middleware:', req.userId);
  try {
    const { title, description, status } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }


    const task = new Task({
      title,
      description,
      status: status || 'TODO',
      user: req.userId,
    })
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  // try {
  //   const { title, description, status } = req.body;
  //   const task = await Task.findOneAndUpdate(
  //     { _id: req.params.id, user: req.userId },
  //     { title, description, status },
  //     { new: true, runValidators: true}
  //   );
  //   if (!task) {
  //     return res.status(404).json({ message: 'Task not found' });
  //   }
  //   res.json(task);
  // } catch (error) {
  //   console.error('Error updating task:', error);
  //   if (error.name === 'ValidationError') {
  //     return res.status(400).json({ message: 'Validation error', error: error.message });
  //   }
  //   res.status(500).json({ message: 'Server error', error: error.message });
  // }
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    console.log('Updating task:', id, req.body);

    if (!id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Updated task:', task);
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID', error: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }

});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;