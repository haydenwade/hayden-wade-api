const s3BucketRepo = require('../repositories/s3Bucket');

const routes = {
    get: (request, res) => {
        s3BucketRepo.fetchBriefingsFromS3Bucket(request.params.feedName).then((resp) => {
            res.status(200);
            res.json(resp);
        }).catch((err) => {
            res.status(err.status);
            res.json(err);
        });
    },
    post: (request, res) => {
        const feedName = request.params.feedName;
        const briefings = JSON.parse(request.body.briefings);//TODO: may be multer config for this

        let mediaPromises = [];
        const files = request.files;
        if (files && files.length > 0) {
            files.forEach(file => {
                mediaPromises.push(s3BucketRepo.uploadMediaToS3Bucket(feedName, file));
            });
        }

        //we want to upload all files successfully before we update the feed data
        Promise.all(mediaPromises).then(() => {
            s3BucketRepo.uploadBriefingsToS3Bucket(feedName, briefings).then(() => {
                res.status(200);
                res.end();
            }).catch((err) => {
                res.status(err.status);
                res.json(err);
            });
        }).catch((err) => {
            res.status(err.status);
            res.json(err);
        });
    }
};


module.exports = routes