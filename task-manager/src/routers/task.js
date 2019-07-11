const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=5
// GET /tasks?sortBy=createAt_desc
router.get('/tasks', auth, async (req, res) => {
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((error) => {
    //     res.status(500).send(error)
    // })
    const match = {}
    if (req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] === 'asc') ? 1 : -1
    }
    try {
        // const tasks = await Task.find({owner:req.user._id})
        // res.send(tasks)
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    // Task.findById(req.params.id)
    //     .then((task) => {
    //         if (!task) return res.status(404).send()
    //         res.send(task)
    //     })
    //     .catch((error) => {
    //         res.status(500).send(error)
    //     })
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) return res.status(404).send()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update))
    if (!isValidUpdate) return res.status(400).send({ 'error': 'Invalid updates' })
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send()
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router