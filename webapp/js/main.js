require.config({
    baseUrl:'js/',
    paths:{
        jquery:'../libs/jquery-1.8.2.min'
    },

    shim:{
        "jquery":{
            exports:"jQuery"
        }
    }

});

require(['jquery'], function($) {
    alert('required');
});
