
function csvToArray(csvData) {
    var result = $.csv.toObjects(csvData);
    console.log(result);
    return(result);
}

function processData(employeeData) {
    const employees = {};
    let root = null;
    
    // Skip header row
    for (const row in employeeData) {
        const id = row["organizationPerson.title"];
        
        employees[id] = {
        id: id,
        name: row.displayName,
        title: id,
        supervisorId: row["user.manager.title"],
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
    
    console.log(JSON.stringify(root));
    return root;
}
    
$(function() {

    $('#chart-container').append(`<i class="oci oci-spinner spinner"></i>`);
    $.ajax({
    'url': 'people.csv',
    'dataType': 'text'
    })
    .done(function(data, textStatus, jqXHR) {
        console.log('AJAX request successful');
        const employeeData = csvToArray(data);
        const orgData = processData(employeeData);
        $('#chart-container').orgchart({
        'data': orgData,
        'nodeContent': 'title'
        });
    })
    .always(function() {
        $('#chart-container').children('.spinner').remove();
    });
    
});
