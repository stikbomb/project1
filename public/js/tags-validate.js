$(document).ready(function() {
    $('#admin').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            tags: {
                validators: {
                    regexp: {
                        regexp: "[a-zA-Z0-9;]{1,30}$",
                        message: 'The full name can consist of alphabetical characters and spaces only'
                    }
                }
            }
        }
    });
});