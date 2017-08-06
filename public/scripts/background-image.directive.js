app.directive('backgroundImage', function(){
    return function(scope, element, attrs){
        var url = attrs.backgroundImage;
        element.css({
            'background-image': 'url(/galleryImages/' + url +')',
            'background-size' : 'cover'
        });
    };
});