
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
            mail: row['user.mail'],
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
        const childrenCt = employeeData.filter((item) => item["user.manager.title"] == employee.title).length;
        // if not the root and has more than 4 direct reports, mark as hybrid
        if (childrenCt > 4 && employee.id != root.id) {
            employee.hybrid = true;
        }
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
            var thisEmployee = employeeData.find(item => item.displayName == `${data.name}`);
            var secondMenuIcon = $('<a>', {
            'class': 'fa-solid fa-circle-info second-menu-icon',
            'href': `https://contacts.google.com/${data.mail}`,
            'target': "detail"
            });
            $node.append(secondMenuIcon);
        }
        });
    })
    .always(function() {
        $('#chart-container').children('.spinner').remove();
    });
    
});
