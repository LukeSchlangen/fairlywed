app.factory("AccountCompletionFactory", ["VendorAccountFactory", "VendorDetailsFactory", "SubvendorFactory", "$http", function (VendorAccountFactory, VendorDetailsFactory, SubvendorFactory) {

    var accountCompletion = { checklist: {}, percentage: 0 };

    accountCompletion.checklist.packageAvailability = false;
    accountCompletion.checklist.minimumImageUploads = false;
    accountCompletion.checklist.futureAvailability = false;
    accountCompletion.checklist.subvendorDescription = false;
    accountCompletion.checklist.subvendorCreated = true;
    accountCompletion.checklist.subvendorCreated = true;
    accountCompletion.checklist.vendorTravelDistanceTooHigh = true;
    accountCompletion.checklist.vendorTravelDistance = true;

    // Check vendor location exists
    accountCompletion.checklist.vendorLocation = vendorLocationCompletion();

    function vendorLocationCompletion() {
        if (VendorAccountFactory.vendors.list.length > 0) {
            accountCompletion.checklist.vendorLocation = true;
            VendorAccountFactory.vendors.list.forEach(function (vendor) {
                if (vendor.name) {
                    accountCompletion.checklist.vendorLocation = false;
                    accountCompletion.nextStepMessage = 'Add location for business';
                    accountCompletion.nextStepLink = 'Add legal name of business';
                }
            });
        } else {
            accountCompletion.checklist.vendorLocation = false;
        }
    };


    // Check legal business name
    accountCompletion.checklist.legalNameOfBusiness = true;
    if (VendorAccountFactory.vendors.list.length > 0) {
        VendorAccountFactory.vendors.list.forEach(function (vendor) {
            if (vendor.name) {
                accountCompletion.checklist.legalNameOfBusiness = false;
                accountCompletion.nextStepMessage = 'Add legal name of business';
                accountCompletion.nextStepLink = 'Add legal name of business';
            }
        });
    } else {
        accountCompletion.checklist.legalNameOfBusiness = false;
    }




    calculateCompletionPercentage(accountCompletion.checklist);

    function calculateCompletionPercentage(checklist) {
        accountCompletion.percentage = 0;
        var totalTasks = 0;
        var tasksComplete = 0;
        for (var property in checklist) {
            if (checklist.hasOwnProperty(property)) {
                totalTasks += 1;
                if (checklist[property]) {
                    tasksComplete += 1;
                }
            }
        }
        if (tasksComplete > 0) {
            accountCompletion.percentage = tasksComplete / totalTasks * 100;
        }
    }

    return {
        accountCompletion: accountCompletion,
        calculateCompletionPercentage: calculateCompletionPercentage
    };
}]);