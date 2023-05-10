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

describe('/api/not-a-route', () => {
    it('GET - status 404 - invalid endpoints', () => {
        return request(app)
            .get('/api/not-a-route')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Not found.')
            })
    })
})

describe('/api/topics', () => {
    it('GET - status 200 - an array of topic objects,  each of which should have the following properties: slug, description.', () => {
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


describe('/api/articles/:article_id', () => {
    it('GET - status 200 - respond with the correct data by article_id', () => {
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

    it('GET - status 404 - invalid numeric article_id will respond with not found.', () => {
        return request(app)
            .get('/api/articles/99999')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('No results.')
            })
    })


    it('GET - status 400 - invalid non-numeric article_id will respond with bad request', () => {
        return request(app)
            .get('/api/articles/non-sense')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Bad request.')
            })
    })
})