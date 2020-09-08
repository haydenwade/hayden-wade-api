const rp = require('request-promise');
const config = require('../config');

const permissions = (req, res, next) => {
    const request = {
        uri: config.auth.userInfo,
        json: true,
        headers: {
            Authorization: req.headers.authorization
        }
    };
    rp(request).then((resp) => {
        const userFeeds = resp[`${config.auth.domain}/app_metadata`].feeds;
        const requestedFeed = req.params['feedName'];
        if (userFeeds.indexOf(requestedFeed) === -1) {
            res.status(403);
            res.json({
                "status": 403,
                "message": "Forbidden"
            });
            return;
        }
        next();
        return;
    }).catch((err) => {
        res.status(500);
        res.json({
            "status": 500,
            "message": "Could not process the request at this time. - validating permissions"
        });
        return;
    });
};

module.exports = permissions;