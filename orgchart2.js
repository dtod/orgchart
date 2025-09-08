
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
        if (row.NAME_DISPLAY.indexOf("Empty") >= 0) {
            continue;
        }
        // Assuming CSV columns: displayName, organizationPerson.title, user.manager.title
        var supervisorId = row.REPORTS_TO;
        const id = row.IDENTIFIER_NAME;

        if (supervisorId == '1907711') {
            supervisorId = "3803059"
        }
        
        employees[id] = {
            id: id,
            name: row.NAME_DISPLAY,
            title: row.JOBTITLE,
            supervisorId: supervisorId,
            mail: row.email,
            children: []
        };
        
        // Find the root (no supervisor_id)
        // if (supervisorId.trim() === "") {
        //     root = employees[id];
        // }

        if (id == '3803059') {
            root = employees[id];
        }
    }
    
    // Build the tree structure
    for (const id in employees) {
        const employee = employees[id];
        const childrenCt = employeeData.filter((item) => item["REPORTS_TO"] == employee.id).length;
        // if not the root and has more than 4 direct reports, mark as hybrid, 
        // which will display vertically instead of horizontally
        if (childrenCt > 5 && employee.id != root.id) {
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
    'url': 'people2.csv',
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
            'href': `https://us1.teamdynamix.com/tdapp/form/rotcmo?__cust=vccs&tdxusername=${data.mail}`,
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
