
function csvToArray(csvData) {
    var result = $.csv.toObjects(csvData);
    // console.log(result);
    return(result);
}

function processData(employeeData) {
    const employees = {};
    let root = null;
    
    // Skip header row
    for (const rownum in employeeData) {
        const row = employeeData[rownum];
        // Assuming CSV columns: displayName, organizationPerson.title, user.manager.title
        const supervisorId = row["user.manager.title"];
        const id = row["organizationalPerson.title"];
        
        employees[id] = {
            id: id,
            name: row.displayName,
            title: id,
            supervisorId: supervisorId,
            children: []
        };
        
        // Find the root (no supervisor_id)
        if (supervisorId === "") {
            root = employees[id];
        }
    }
    
    // Build the tree structure
    for (const id in employees) {
        const employee = employees[id];
        if (employee.supervisorId !== "" && employees[employee.supervisorId]) {
            employees[employee.supervisorId].children.push(employee);
        }
    }
    
    // console.log(JSON.stringify(root));
    return root;
}
    
$(function() {

    $('#chart-container').append(`<i class="fa-solid fa-spinner spinner"></i>`);
    $.ajax({
    'url': 'people.csv',
    'dataType': 'text'
    })
    .done(function(data, textStatus, jqXHR) {
        // console.log('AJAX request successful');
        const employeeData = csvToArray(data);
        const orgData = processData(employeeData);
        $('#chart-container').orgchart({
        'data': orgData,
        'nodeContent': 'title',
        'verticalLevel': 4,
        'pan': true,
        'createNode': function($node, data) {
            var secondMenuIcon = $('<i>', {
            'class': 'fa-solid fa-circle-info second-menu-icon',
            mouseover: function() { 
                $('.second-menu').not($(this).siblings('.second-menu')).hide(); 
            },
            click: function() {
                $('.second-menu').not($(this).siblings('.second-menu')).hide();
                $(this).siblings('.second-menu').toggle();
                $(this).siblings('.second-menu').load('https://us1.teamdynamix.com/tdapp/app/form/start?c=NjU3NDc5OGEtMjRkNi00NTYyLWFlNmUtMGZhNDMyNzRlNWYy&t=cVlSQTlBPT1xbTRiQTVhRU5hbzYxbDAxNm1DK2N3UnpnNG5rQUJMN3JMdEJrZ2dUeWFFS3V2eTFYai9zeHVyWWZDajhDV3JjWUhZelNLWGpXKzlNTFBtem5SSU0vZz09&tdxusername=ncs21067@email.vccs.edu');
            }
            });
            var secondMenu = '<div class="second-menu">Content here..if possible</div>';
            $node.append(secondMenuIcon).append(secondMenu);
        }
        });
    })
    .always(function() {
        $('#chart-container').children('.spinner').remove();
    });
    
});
