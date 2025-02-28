const express = require('express');
const cron = require('node-cron');

const app = express();

cron.schedule('* * * * *',() => {
    console.log('Cron Job Running Every minute');
})

app.listen(3232, () =>{
    console.log('Server is runnig on port',3232);
})

// https://crontab.guru/#5_4_29_9_2

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *


// second	0-59
// minute	0-59
// hour	0-23
// day of month	1-31
// month	1-12 (or names)
// day of week	0-7 (or names, 0 or 7 are sunday)