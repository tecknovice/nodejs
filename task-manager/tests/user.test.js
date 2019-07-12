const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    name: 'user',
    email: 'user@test.com',
    password: 'abcdefg',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRET)
    }]
}
beforeEach(async () => {
    await User.deleteMany()
    await new User(user).save()
})
test('should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Test',
        email: 'test@test.com',
        password: '1234567'
    }).expect(201)
})
test('should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: user.email,
        password: user.password
    }).expect(200)
})
test('should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: 'notexist@test.com',
        password: 'notexist'
    }).expect(400)
})
test('should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)
})