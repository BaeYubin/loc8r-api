/* GET homepage */
const about = function(req,res){
    res.render('generic-text',{
        title: 'About Loc8c 2020700101_Yubin Bae',
        content: 'Loc8r was created to help people find places to sit down \
        and get a bit of work done.<br/><br/>Lorem ipsum dolor sit \
        amet, consectetur adipiscing elit. Nunc sed locem ac nisi digni \
        ssim accumsan. Nellam sit amet interdum magna. Morbi quis \
        faucibus nisi. Vestibulum mollis purus quis eros adipiscing \
        tristique. Proin posuere semper tellus, id placerat augue dapibus \
        ornare. Aenean leo metus, tempus in nisl eget, accumsan interdum \
        dui. pellentesque sollicitudin vilutat ullamcorper.'});
        };

module.exports = {
    about
};