const app = require('../app');
const connection = require('../db/connection');
const seed = require('../db/seeds/seed');
const request = require('supertest');
const endpointList = require('../endpoints.json');
const testData = require('../db/data/test-data/index');

beforeEach(() => {
    return seed(testData);
})

afterAll(() => {
    if (connection) {
        return connection.end()
    };
})


describe('/api', () => {
    it('GET - status 200 - responds with JSON object.', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({body}) => {
                const {endpoints} = body;
                expect(typeof endpoints).toBe('object');
                expect(Object.entries(endpoints).length).toBe(Object.entries(endpointList).length)
            })
    })
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


describe('/api/articles', () => {
    it('GET - status 200 - responds with an array of articles from database.', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                const {articleData} = testData;

                expect(articles).toBeArray();
                expect(articles.length).toBe(articleData.length);

                articles.forEach(article => {
                    expect(article)
                })
            })
    })

    it('GET - status 200 - the received array should be sorted by date in descending order.', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles).toBeSortedBy('created_at', {descending: true})
            })
    })

    it('GET - status 200 - the object should contain certain properties.', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                articles.forEach(article => {
                    const articleTemplate = {
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        votes: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        article_img_url: expect.stringMatching(/^http(s)?:\/\//),
                        comment_count: expect.any(Number)
                    }
                    expect(article).toMatchObject(articleTemplate);
                    expect(article.created_at).toBeDateString();
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
                const articleTemplate = {
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: 2,
                    body: expect.any(String),
                    votes: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.stringMatching(/^http(s)?:\/\//)
                }
                expect(article).toMatchObject(articleTemplate)
                expect(article.article_id).toBe(2);
                expect(article.created_at).toBeDateString();
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


    it('GET - status 400 - invalid non-numeric article_id will respond with bad request.', () => {
        return request(app)
            .get('/api/articles/non-sense')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
            })
    })

    it('PATCH - status 201 - responds with the updated article.', () => {
        const example = { inc_votes : 1 };

        return request(app)
            .patch('/api/articles/2')
            .send(example)
            .expect(201)
            .then(({body}) => {
                const {article} = body;
                const articleTemplate = {
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: 2,
                    body: expect.any(String),
                    votes: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.stringMatching(/^http(s)?:\/\//)
                }

                expect(article).toMatchObject(articleTemplate);
                expect(article.votes).toBe(example.inc_votes);
            })
    })

    it('PATCH - status 201 - the article in database is updated accordingly.', () => {
        const example = { inc_votes : 1000 };
        const article_id = 2;
        return request(app)
            .patch(`/api/articles/${article_id}`)
            .send(example)
            .expect(201)
            .then(() => {
                return connection
                    .query(`
                        SELECT * FROM articles
                        WHERE article_id in ($1);
                    `, [article_id])
            })
            .then(({rows}) => rows[0])
            .then(article => {
                expect(article.votes).toBe(example.inc_votes);
            })
    })

    it('PATCH - status 400 - invalid request format.', () => {
        return request(app)
            .patch('/api/articles/2')
            .send({ nonsense: 'Wahaha' })
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.')
            })
    })

    it('PATCH - status 400 - no request body.', () => {
        return request(app)
            .patch('/api/articles/2')
            .send({})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.')
            })
    })

    it('PATCH - status 400 - invalid numeric article_id.', () => {
        return request(app)
            .patch('/api/articles/99999')
            .send({ inc_votes : 1 })
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The article_id does not exist (for now).')
            })
    })

    it('PATCH - status 400 - invalid non-numeric article_id.', () => {
        return request(app)
            .patch('/api/articles/non-sense')
            .send({ inc_votes : 1 })
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
            })
    })
})

describe('/api/articles/:article_id/comments', () => {
    it('GET - status 200 - responds with an array of comments for the given article_id.', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                expect(comments).toBeArray();
                comments.forEach(comment => {
                    expect(comment.article_id).toBe(1);
                })
            })
    })

    it('GET - status 200 - each comment should have the certain properties.', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                const commentTemplate = {
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: expect.any(Number),
                }
                comments.forEach(comment => {
                    expect(comment).toMatchObject(commentTemplate);
                })
            })
    })

    it('GET - status 200 - comments should be served with the most recent comments first.', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                expect(comments).toBeSortedBy('created_at', {descending: true});
            })
    })

    it('GET - status 200 - existing article_id without comments will return an empty array.', () => {
        return request(app)
        .get(`/api/articles/2/comments`)
        .expect(200)
        .then(({body}) => {
            const {comments} = body;
            expect(comments).toBeArrayOfSize(0); 
        })
    })

    it('GET - status 400 - invalid non-numeric article_id', () => {
        return request(app)
            .get('/api/articles/non-sense/comments')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
        })
    })

    it('GET - status 404 - invalid numeric article_id.', () => {
        return request(app)
            .get('/api/articles/99999/comments')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The article_id does not exist (for now).')
        })
     })
     
     it('POST - status 201 - responds with the posted comment in format of an object with properties of "username" and "body".', () => {
        const example = {username: "lurker", body: "Good read!"};
        return request(app)
            .post('/api/articles/2/comments')
            .send(example)
            .expect(201)
            .then(({body}) => {
                const {comment} = body;
                const commentTemplate = {
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: expect.any(Number),
                }
                expect(comment).toMatchObject(commentTemplate);
                expect(comment.author).toBe(example.username);
                expect(comment.body).toBe(example.body)
        })
     })

     it('POST - status 400 - the request body is not in correct format.', () => {
        return request(app)
            .post('/api/articles/2/comments')
            .send({nonsense: 'XXX', body: "Good read!"})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.')
        })
    })

    it('POST - status 404 - the article_id is not existing.', () => {
        return request(app)
            .post('/api/articles/99999/comments')
            .send({username: "lurker", body: "Good read!"})
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Request value does not exist at the moment in database.')
        })
    })


    it('POST - status 404 - the username is not existing.', () => {
        return request(app)
            .post('/api/articles/2/comments')
            .send({username: "XXXX", body: "Good read!"})
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Request value does not exist at the moment in database.')
        })
    })

    it('POST - status 400 - the article_id is invalid (non-numeric).', () => {
        return request(app)
            .post('/api/articles/non-sense/comments')
            .send({username: "lurker", body: "Good read!"})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
        })
    })
})


describe('/api/comments/:comment_id', () => {
    it('DELETE - status 204 - delete the given comment by comment_id from database', () => {
        return request(app)
            .delete('/api/comments/2')
            .expect(204)
            .then(({body}) => {
                expect(body).toBeEmptyObject();
            })
    })
    it('DELETE - status 404 - non exsiting comment_id', () => {
        return request(app)
            .delete('/api/comments/99999')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The comment_id does not exist (for now).')
            })
    })
    it('DELETE - status 400 - invalid comment_id', () => {
        return request(app)
            .delete('/api/comments/non-sense')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
            })
    })
})