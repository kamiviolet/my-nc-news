const app = require('../app');
const connection = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/index');
const request = require('supertest');

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


describe('GET /api/articles/:article_id', () => {
    it('status 200, respond with the correct data by article_id', () => {
        return request(app)
            .get('/api/articles/2')
            .expect(200)
            .then(({body}) => {
                const {article} = body;

                expect(article).toHaveProperty('author', expect.any(String));
                expect(article).toHaveProperty('title', expect.any(String));
                expect(article).toHaveProperty('article_id', expect.any(Number));
                expect(article).toHaveProperty('body', expect.any(String));
                expect(article).toHaveProperty('votes', expect.any(Number));
                expect(article).toHaveProperty('article_img_url', expect.any(String));
                expect(article.article_id).toBe(2);
            })
    })

    it('status 400, invalid numeric article_id will respond with bad request', () => {
        return request(app)
            .get('/api/articles/99999')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Bad request.')
            })
    })
})