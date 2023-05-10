const app = require('../app');
const connection = require('../db/connection');
const seed = require('../db/seeds/seed');
const request = require('supertest');
const endpoints = require('../endpoints.json');
const testData = require('../db/data/test-data/index');

beforeEach(() => {
    return seed(testData);
})

afterAll(() => {
    if (connection) connection.end();
})

describe('GET /api/topics', () => {
    it('status 200, responds with an array of topic objects,  each of which should have the following properties: slug, description.', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                const {topics} = body;
                const {topicData} = testData;

                expect(topics).toBeArray();
                expect(topics.length).toBe(topicData.length);

                topics.forEach(topic => {
                    expect(topic).toHaveProperty('slug', expect.any(String));
                    expect(topic).toHaveProperty('description', expect.any(String));
                })
            })
    })
})

describe('GET /api/not-a-route', () => {
    it('status 404 if the endpoint is not valid', () => {
        return request(app)
            .get('/api/not-a-route')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Not found.')
            })
        })
})

describe('GET /api', () => {
    it('status 200, responds with JSON object.', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({body}) => {
                const parsedEndpoints = JSON.parse(body.endpoints);

                expect(parsedEndpoints).toBeInstanceOf(Object);
                expect(Object.entries(parsedEndpoints).length).toBe(Object.entries(endpoints).length)
            })
    })
})
