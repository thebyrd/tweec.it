var expect = require('expect.js')
  , Browser = require('zombie')
  , browser = new Browser();

describe('Loads pages', function(done){

  it('Google.com', function(done){
    browser.visit('http://www.google.com', function(){
      expect(browser.text("title")).to.equal('Google');
      done();
    })
  });
});