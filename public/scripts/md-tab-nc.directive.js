app.directive('mdActiveNc', MdActiveNoClick);

function MdActiveNoClick() {
    return {
        link: link,
        require: '^?mdTabs',
        restrict: 'A'
    };

    function link(scope, element, attributes, ctrl) {
        var index = ctrl.getTabElementIndex(element);
        scope.$watch(attributes.mdActiveNc, function (active) {
            if (active) {
                ctrl.focusIndex = ctrl.selectedIndex = index;
                ctrl.lastClick = true;
            }
        });
    }
}