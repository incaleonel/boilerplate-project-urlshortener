require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
require('./connection');
const Links = require('./model')
const dns = require('dns');
const { rejects } = require('assert');

// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.get('/api/shorturl/:shorturl',(req,res)=>{
    
   Links.findOne({short_url: req.params.shorturl},(err,data)=>{
      if(err) console.log(err);
      res.redirect(data.original_url)
    });
});

app.post('/api/shorturl', async function (req,res){ 
  let obj = {};
      
  try{
      const url = new URL(req.body.url);
    
      await dns.promises.lookup(url.hostname)
      
      let document = await Links.findOne({original_url: url.href},                  
         {original_url:1,short_url:1,_id:0})
      if(document){
        Object.assign(obj,document._doc)
      }else{
        const count= await Links.estimatedDocumentCount()
        obj = {
          original_url: url.href,
          short_url: count + 1
        }
            const link = new Links(obj); 
            link.save().then(()=>console.log('Saved successfully',link))
                        .catch(err=>console.log(err))
        
      }
   } catch{
      obj = {error: 'Invalid URL'}
   }
   res.json(obj);
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
