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


describe('/api', () => {
    it('GET - status 200 - responds with JSON object.', () => {
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
                expect(message).toBe('Bad request.')
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
        return connection
            .query(`
                SELECT
                articles.article_id, COUNT(comments.*) AS comment_count
                FROM articles
                LEFT JOIN comments USING (article_id)
                GROUP BY articles.article_id
            `)
            .then(({rows}) => {
                return rows.filter(article => +article.comment_count === 0)
            })
            .then(articlesWithoutComments => {
                return articlesWithoutComments.map(article => article.article_id)
            })
            .then(listOfArticlesWithoutComments => {
                let index = 0;
                let length = listOfArticlesWithoutComments.length

                if (length === 0) {
                    return;
                } else if (length === 1) {
                    index = index;
                } else {
                    index = Math.ceil(Math.random() * length)
                }
                return listOfArticlesWithoutComments[index];
            })
            .then((id) => {
                if (id === undefined) return;
                return request(app)
                    .get(`/api/articles/${id}/comments`)
                    .expect(200)
                    .then(({body}) => {
                        const {comments} = body;
                        expect(comments).toBeArrayOfSize(0); 
                    })
            })
    })

    it('GET - status 400 - invalid non-numeric article_id will respond with bad request', () => {
        return request(app)
            .get('/api/articles/non-sense/comments')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Bad request.')
        })
    })

    it('GET - status 404 - invalid numeric article_id will respond with not found.', () => {
        return request(app)
            .get('/api/articles/99999/comments')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The article_id is currently not found.')
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

     it('POST - status 201 - should create a new comment with correct information in the database', () => {
        const example = {username: "lurker", body: "Good read!"};
        const article_id = 2;
        return request(app)
            .post(`/api/articles/${article_id}/comments`)
            .send(example)
            .expect(201)
            .then(() => {
                return connection
                    .query(`
                        SELECT * FROM comments
                        WHERE author = $1 AND body = $2 AND article_id = $3;
                    `, [example.username, example.body, article_id])
            })
            .then(({rows}) => {
                expect(rows.length).toBe(1);
                expect(rows[0].author).toBe(example.username);
                expect(rows[0].body).toBe(example.body);
                expect(rows[0].article_id).toBe(article_id);
            })
     })

     it('POST - status 400 - the request body is not in correct format.', () => {
        return request(app)
            .post('/api/articles/2/comments')
            .send({nonsense: 'XXX', body: 'XXXX'})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Comment not in correct format.')
        })
    })

    it('POST - status 400 - the article_id is not existing.', () => {
        return request(app)
            .post('/api/articles/99999/comments')
            .send({username: 'XXX', body: 'XXXX'})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Apology. Non-existing article_id.')
        })
    })


    it('POST - status 400 - the username is not existing.', () => {
        return request(app)
            .post('/api/articles/2/comments')
            .send({username: 'XXX', body: 'XXXX'})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Apology. Non-existing username, please sign up to leave your comment.')
        })
    })

    it('POST - status 400 - the article_id is invalid (non-numeric).', () => {
        return request(app)
            .post('/api/articles/non-sense/comments')
            .send({username: 'XXX', body: 'XXXX'})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid article_id.')
        })
    })
})

