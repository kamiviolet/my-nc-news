const db = require('../connection')

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.validateExistingId = (id) => {
  return db
    .query(`
      SELECT * 
      FROM articles
      WHERE article_id in ($1)
    `, [id])
    .then(({rows}) => {
      if (rows.length === 0) {
        return {status: 404, message: 'The article_id is currently not found.'}
      }
    })
}

exports.validateExistingUser = (username) => {
  return db
    .query(`
      SELECT * 
      FROM users
      WHERE username in ($1)
    `, [username])
    .then(({rows}) => {
      if (rows.length === 0) {
        return {status: 404, message: 'The username is currently not found.'}
      }
    })
}