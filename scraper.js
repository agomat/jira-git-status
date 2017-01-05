var casper = require('casper').create({
    verbose: true,  // <---------------------------- SET true FOR DEBUG
    logLevel: "info",
    loadImages: false,
    loadPlugins: false,
    pageSettings: {
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36"
    }
});

var x = require('casper').selectXPath;
var fs = require('fs');

///////////////////////////////////
// Setting working dir (http://stackoverflow.com/questions/16769057/how-to-get-currently-executed-file-directory-in-casperjs)
///////////////////////////////////

// Since Casper has control, the invoked script is deep in the argument stack
var currentFile = require('system').args[3];
var curFilePath = fs.absolute(currentFile).split('/');

if (curFilePath.length > 1) {
    curFilePath.pop(); // PhantomJS does not have an equivalent path.baseName()-like method
    fs.changeWorkingDirectory(curFilePath.join('/'));
}

var cookiejar = fs.workingDirectory + "/cookiejar",
    urls = fs.workingDirectory + "/urls";

if ( !fs.exists(cookiejar) ) {
    casper.echo("No cookiejar!");
    casper.exit();
}

cookies = fs.read(cookiejar,'utf8').toString();
phantom.cookies = JSON.parse(cookies);

if ( !fs.exists( urls ) ) {
    casper.echo("Urls file not found!");
    casper.exit();
}

try {
    urls = JSON.parse( fs.read(urls,'utf8').toString() );
} catch(e){
    casper.echo("Urls file malformed");
    casper.exit();
}

///////////////////////////////////
// Casper start
///////////////////////////////////
casper.start();

// Navigate to dashoard
for( var i=0; i < urls.length; ++i ) {
    
    var url = urls[i];
    casper.thenOpen( url , function(){

        this.capture('log.png');

        var result = this.evaluate(function(){

            var result = {},
                issues = document.querySelectorAll('.ghx-issue');

            for(var i=0; i<issues.length; ++i) {
                var summary = issues[i].querySelector('.ghx-summary').innerText;
                var tags = issues[i].querySelector('.ghx-extra-field-content').innerText;
                var id = issues[i].querySelector('.ghx-key').innerText;
                result[id] = {
                    'summary': summary,
                    'tags': tags
                }
            }

            return JSON.stringify( result );

        });

        result = JSON.parse(result);

        for(var id in result) {
            var string = result[id].summary + " / " + result[id].tags;
            fs.write(fs.workingDirectory + "/tasks/"+id, string, 644);
        }

    });
} //end plain for

casper.run(function() {
    this.exit();
});
