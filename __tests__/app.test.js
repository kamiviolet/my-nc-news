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

    it('POST - status 201 - responds with the newly added topic object.', () => {
        const toBeAdded = {
            "slug": "news",
            "description": "any global or local news."
        }

        return request(app)
            .post('/api/topics')
            .send(toBeAdded)
            .expect(201)
            .then(({body}) => {
                const {newTopic} = body;
                expect(newTopic).toEqual(toBeAdded);
            })
    })

    it('POST - status 400 - invalid format for creating new topic.', () => {
        const toBeAdded = {
            "slug": "news",
        }

        return request(app)
            .post('/api/topics')
            .send(toBeAdded)
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Please provide description to create new topic.');
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
                
                expect(articles).toBeArray();
            })
    })

    it('GET - status 200 - default sorted by date in descending order and limit within 10 results.', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles).toBeSortedBy('created_at', {descending: true});
                expect(articles).toBeArrayOfSize(10);
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

    it('GET - status 200 - accept queries: topic to filter related topic.', () => {
        return request(app)
            .get('/api/articles?topic=mitch')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                articles.forEach(article => {
                    expect(article.topic).toBe('mitch');
                })
            })
    })

    it('GET - status 200 - accept queries: sort_by to sort the entries by any specific column.', () => {
        return request(app)
            .get('/api/articles?sort_by=author')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles).toBeSortedBy('author', {descending: true});
            })
    })

    it('GET - status 200 - accept queries: order to change the display order.', () => {
        return request(app)
            .get('/api/articles?order=asc')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles).toBeSortedBy('created_at', {descending: false});
            })
    })

    it('GET - status 200 - existing topic but without articles at the moment.', () => {
        return request(app)
            .get('/api/articles?topic=paper')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles).toBeArrayOfSize(0);
            })
    })

    it('GET - status 200 - accept multi queries at the same time.', () => {
        const query1 = 'topic=mitch';
        const query2 = 'sort_by=votes';
        const query3 = 'order=asc';

        return request(app)
            .get(`/api/articles?${query1}&${query2}&${query3}`)
            .expect(200)
            .then(({body}) => {
                const {articles} = body;

                expect(articles).toBeSortedBy('votes', {descending: false});

                articles.forEach(article => {
                    expect(article.topic).toBe('mitch');
                })
            })
    })

    it('GET - status 200 - accept queries: limit to limit how many entries are shown.', () => {
        return request(app)
            .get('/api/articles?limit=20')
            .expect(200)
            .then(({body}) => {
                const {articles, total_count} = body;
                expect(articles).toBeArrayOfSize(12);
                expect(total_count).toBe(12);
            })
    })

    it('GET - status 200 - accept queries: p to determine which range of entries to be shown.', () => {
        return request(app)
            .get('/api/articles?limit=10&p=2&sort_by=article_id&order=asc')
            .expect(200)
            .then(({body}) => {
                const {articles} = body;
                expect(articles.length).toBe(2);
                expect(articles[0].article_id).toBe(11);
            })
    })

    it('GET - status 404 - non existing topic for filtering.', () => {
        return request(app)
            .get('/api/articles?topic=XXX')
            .expect(404)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toBe('The topic does not exist (for now).');
                })
    })

    it('GET - status 400 - invalid column for sorting entries.', () => {
        return request(app)
            .get('/api/articles?sort_by=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('Cannot sort by ');
                })
    })

    it('GET - status 400 - invalid value for order query.', () => {
        return request(app)
            .get('/api/articles?order=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('Cannot order by ');
                })
    })

    it('GET - status 400 - invalid value for limit query.', () => {
        return request(app)
            .get('/api/articles?limit=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('is not a valid');
                })
    })

    it('GET - status 400 - invalid value for p query.', () => {
        return request(app)
            .get('/api/articles?p=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('is not a valid');
                })
    })

    it('POST - status 201 - responds with the newly added article, with all the above properties as well as certain properties.', () => {
        const articleTemplate = {
            author: 'icellusedkars',
            title: 'Am I a cat? (Cont\')',
            article_id: expect.any(Number),
            votes: expect.any(Number),
            topic: 'mitch',
            body: 'I would like to be cat.. or not? Do i need to be one only because I like them so much?',
            created_at: expect.any(String),
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        }
        const exampleInput =   {
            author: 'icellusedkars',
            title: 'Am I a cat? (Cont\')',
            topic: 'mitch',
            body: 'I would like to be cat.. or not? Do i need to be one only because I like them so much?',
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          }

        return request(app)
            .post('/api/articles')
            .send(exampleInput)
            .expect(201)
            .then(({body}) => {
                const {article} = body;
                expect(article).toMatchObject(articleTemplate);
            })
    })

    it('POST - status 201 - avatar_url will have default value if not specified.', () => {
        const articleTemplate = {
            author: 'icellusedkars',
            title: 'Am I a cat? (Cont\')',
            article_id: expect.any(Number),
            votes: expect.any(Number),
            topic: 'mitch',
            body: 'I would like to be cat.. or not? Do i need to be one only because I like them so much?',
            created_at: expect.any(String),
            article_img_url: 'https://images.pexels.com/photos/default-avatar.jpg',
        }
        const exampleInput =   {
            author: 'icellusedkars',
            title: 'Am I a cat? (Cont\')',
            topic: 'mitch',
            body: 'I would like to be cat.. or not? Do i need to be one only because I like them so much?',
          }

        return request(app)
            .post('/api/articles')
            .send(exampleInput)
            .expect(201)
            .then(({body}) => {
                const {article} = body;
                expect(article).toMatchObject(articleTemplate);
            })
    })

    it('POST - status 400 - invalid format.', () => {
        const exampleInput =   {
            author: 'icellusedkars',
            title: 'Am I a cat? (Cont\')',
            body: 'I would like to be cat.. or not? Do i need to be one only because I like them so much?',
          }

        return request(app)
            .post('/api/articles')
            .send(exampleInput)
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.');
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
                    comment_count: expect.any(Number),
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
                expect(message).toContain('No articles found for')
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

    it('DELETE - status 204 - responds with no content.', () => {
        return request(app)
            .delete('/api/articles/1')
            .expect(204)
            .then(({body}) => {
                expect(body).toBeEmptyObject();
            })
    })

    it('DELETE - status 404 - non exsiting numeric article_id.', () => {
        return request(app)
            .delete('/api/articles/99999')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The article_id does not exist (for now).')
            })
    })

    it('DELETE - status 400 - invalid non-numeric article_id.', () => {
        return request(app)
            .delete('/api/articles/non-sense')
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
            })
    })
})

describe('/api/articles/:article_id/comments', () => {
    it('GET - status 200 - responds with an array of comments for the given article_id, by default first 10 comments of search will be shown.', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                expect(comments).toBeArray();
                expect(comments.length).toBe(10);
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

    it('GET - status 200 - accept query of limit', () => {
        return request(app)
            .get('/api/articles/1/comments?limit=20')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                expect(comments).toBeArrayOfSize(11);
            })
    })

    it('GET - status 200 - accept query of p', () => {
        return request(app)
            .get('/api/articles/1/comments?p=2')
            .expect(200)
            .then(({body}) => {
                const {comments} = body;
                expect(comments).toBeArrayOfSize(1);
                expect(comments[0].comment_id).toBe(9);
            })
    })

    it('GET - status 400 - invalid value for limit query.', () => {
        return request(app)
            .get('/api/articles/1/comments?limit=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('is not a valid');
                })
    })

    it('GET - status 400 - invalid value for p query.', () => {
        return request(app)
            .get('/api/articles/1/comments?p=XXX')
            .expect(400)
                .then(({body}) => {
                    const {message} = body;
                    expect(message).toContain('is not a valid');
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
                expect(message).toBe('Please provide username.')
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
    it('PATCH - status 201 - responds with the updated comment.', () => {
        const example = { inc_votes : 10 };

        return request(app)
            .patch('/api/comments/2')
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
                expect(comment.votes).toBe(24);
            })
    })
    it('PATCH - status 400 - invalid request format.', () => {
        return request(app)
            .patch('/api/comments/2')
            .send({ nonsense: 'Wahaha' })
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.')
            })
    })

    it('PATCH - status 400 - no request body.', () => {
        return request(app)
            .patch('/api/comments/2')
            .send({})
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request format.')
            })
    })

    it('PATCH - status 400 - invalid numeric article_id.', () => {
        return request(app)
            .patch('/api/comments/99999')
            .send({ inc_votes : 1 })
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The comment_id does not exist (for now).')
            })
    })

    it('PATCH - status 400 - invalid non-numeric article_id.', () => {
        return request(app)
            .patch('/api/comments/non-sense')
            .send({ inc_votes : 1 })
            .expect(400)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('Invalid request input.')
            })
    })
})

describe('/api/users', () => {    
    it('GET - status 200 - responds with an array of objects.', () => {
        const {userData} = testData;

        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                const {users} = body;
                expect(users).toBeArray();
                expect(users).toBeArrayOfSize(userData.length);
            })
    })

    it('GET - status 200 - every objects contains certain properties.', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                const {users} = body;
                users.forEach(user => {
                    expect(user).toHaveProperty('username');
                    expect(user).toHaveProperty('name');
                    expect(user).toHaveProperty('avatar_url');
                })
            })
    })

    it('POST - status 201 - post a new user', () => {
        return request(app)
            .post('/api/users')
            .send({
                username: "kami",
                name: "kami",
                avatar_url: ""
            })
            .expect(201)
            .then(({body}) => {
                const {user} = body;
                expect(user).toHaveProperty('username');
                expect(user).toHaveProperty('name');
                expect(user).toHaveProperty('avatar_url');
            })
    })
})

describe('/api/users/:username', () => {
    it('GET - status 200 - responds with a user object which have the properties: username, name and avatar_url.', () => {
        return request(app)
            .get('/api/users/rogersop')
            .expect(200)
            .then(({body}) => {
                const {user} = body;
                const expectedResult = {
                    username: 'rogersop',
                    name: 'paul',
                    avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
                  }
                expect(user).toMatchObject(expectedResult);
                expect(user.username).toBe(expectedResult.username);
                expect(user.name).toBe(expectedResult.name);
                expect(user.avatar_url).toBe(expectedResult.avatar_url);
            })
    })
    it('GET - status 404 - nonexisting username.', () => {
        return request(app)
            .get('/api/users/XXXXX')
            .expect(404)
            .then(({body}) => {
                const {message} = body;
                expect(message).toBe('The user XXXXX is not found currently.')
            })
    })

})