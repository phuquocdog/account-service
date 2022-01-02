var express = require('express');
var router = express.Router();

const { Web3Storage,getFilesFromPath } = require('web3.storage')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function makeStorageClient(argument) {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}


async function getFiles(path) {
  const files = await getFilesFromPath(path)
  console.log(`read ${files.length} file(s) from ${path}`)
  return files
}

async function storeFiles(files) {
  const client = makeStorageClient();

  const cid = await client.put(files)
  console.log('stored files with cid:', cid)
  return cid
}
async function retrieve(cid) {
  const client = makeStorageClient()
  const res = await client.get(cid)
  console.log(`Got a response! [${res.status}] ${res.statusText}`)
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`)
  }
  const files = await res.files();
  
  return files[0];
}

router.post('/', async function(req, res, next) {
  try {
      if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
      } else {
        //Use the name of the input field (i.e. "file")
        // to retrieve the uploaded file
        let file = req.files.file;

        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        await file.mv('./uploads/' + file.name);
        let content = await getFiles(process.cwd() + "/uploads/" + file.name)

        let cid = await storeFiles(content)
        //send response
        res.send({
            status: true,
            message: 'File is retrieve',
            data: {
                name: file.name,
                mimetype: file.mimetype,
                size: file.size,
                cid: cid,
                dwebLink: 'https://' + cid + '.ipfs.dweb.link/' + file.name
            }
        });
      }
  } catch (err) {
      console.log(err)
      res.status(500).send(err);
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let file = await retrieve(req.params.id);

    console.log(file);
    res.send({
        status: true,
        message: 'File is uploaded',
        data: {
            name: file.name,
            size: file.size,
            cid: req.params.id,
            dwebLink: 'https://' + req.params.id + '.ipfs.dweb.link/' + file.name
        }
    });
  } catch (err) {
      console.log(err)
      res.status(500).send(err);
  }
});
module.exports = router;
