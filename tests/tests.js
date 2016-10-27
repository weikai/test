var hourly_employee = new Person(0, 'Thomas Jefferson', 'hourly', 10, 23);
var salaried_employee = new Person(1, 'George Washington', 'salaried', 52000, 23);
var scanner = 'Flatbed scanner (i.e., an Epson 11000XL)';
var blank_estimate = estimate;
// QUnit.test("template", function( assert ) {
//     assert.ok(1 == "1", "Passed");
// });

QUnit.test("Estimate object defaults", function( assert ){
    var e = $.extend(true, {}, blank_estimate);

    assert.equal(e.extent, 0, 'extent property');
    assert.equal(e.total_scans(), '', 'capture_device method');
    assert.equal(e.capture_by, '', 'capture by');
    assert.equal(e.scans_per_hundred(), '', 'scans_per_hundred method');

    e.extent = 1200;
    assert.equal(e.extent, 1200, 'extent property');
    assert.equal(e.total_scans(), 1200, 'capture_device property');
    assert.equal(e.scans_per_hundred(), 12, 'scans_per_hundred method');

    assert.equal(e.capture_device, '', 'default capture_device property');
    assert.equal(e.capture_average(), 0, 'capture_average method');

    e.capture_device = 'iphone'; // test value not on list
    assert.equal(e.capture_average(), 0, 'capture_average method from unknown key');

    e.capture_device = 'Flatbed scanner (i.e., an Epson 11000XL)';
    assert.equal(e.capture_average(), 183.55333333333334, 'capture_average method from known key');

});

QUnit.test("Estimate capture", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);
    e.extent = 1200;
    e.capture_device = scanner;
    e.capture_by = hourly_employee;
    // 1 * (1200 / 100) * 183.5533333333333 = 2202.64 minutes
    assert.equal(e.capture_estimate().total, 27092.472000000005, '1 linear foot flatbed capture cost');
    assert.equal(e.capture_estimate().total_time, 2202.6400000000003, '1 linear foot flatbed capture in minutes');
    e.extent = 12000;
    assert.equal(e.capture_estimate().total, 270924.72000000003, '10 linear foot flatbed capture cost');
    assert.equal(e.capture_estimate().total_time, 22026.4, '10 linear foot flatbed capture in minutes');
});

QUnit.test("preparation_estimate", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);

    e.extent = 1200;
    e.capture_device = scanner;

    var prep = e.preparation_of_materials;
    prep.condition_review.percentage = 100;
    prep.condition_review.by = hourly_employee;

    assert.equal(prep.condition_review.average, 15.333333333333334, 'condition review average lookup');
    assert.equal(prep.condition_review.by, hourly_employee, 'hourly_employee doing condition_review');

    assert.equal(e.preparation_estimate().total_time, 184, 'time for condition_review by hourly employee');
    assert.equal(e.preparation_estimate().total, 15.333333333333334, 'total cost for condition review');
    assert.equal(e.preparation_estimate().salaried, 0, 'salary costs for condition review');
    assert.equal(e.preparation_estimate().hourly, 15.333333333333334, 'hourly costs for condition review');

    prep.fastener_removal.percentage = 100;
    prep.fastener_removal.by = salaried_employee;

    assert.equal(e.preparation_estimate().total_time, 525.2121212121212, 'time for condition_review by hourly employee');
    assert.equal(e.preparation_estimate().total, 43.76767676767677, 'total cost for condition review');
    assert.equal(e.preparation_estimate().salaried, 28.434343434343432, 'salary costs for condition review');
    assert.equal(e.preparation_estimate().hourly, 15.333333333333334, 'hourly costs for condition review');

});

QUnit.test("quality_control_estimate", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);

    e.extent = 1200;
    e.capture_device = scanner;
    e.quality_control.level = 'level_1';
    e.quality_control.by = hourly_employee;
    e.quality_control.percentage = 100;

    assert.equal(e.quality_control.level, 'level_1', 'default quality control');
    assert.equal(e.quality_control_estimate().total_time, 543.6123076923077, 'level_1 quality control total_time');
    assert.equal(e.quality_control_estimate().total, 6686.4313846153855, 'level_1 quality control @ 100%');
    e.quality_control.percentage = 50;
    assert.equal(e.quality_control_estimate().total_time, 271.80615384615385, 'level_1 quality control total_time (@50%)');
    assert.equal(e.quality_control_estimate().total, 1671.6078461538464, 'level_1 quality control cost @ 50%');

    e.quality_control.percentage = 100;
    e.quality_control.level = 'level_2'; //37.93333333333333
    assert.equal(e.quality_control_estimate().total_time, 366.6666666666667, 'level_2 quality control total_time');

    // e.quality_control = 'foo';
    // assert.equal(e.quality_control_estimate().total_time, '', 'foo quality control total_time');
});

QUnit.test("post_processing_estimate", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);
    e.extent = 1200;

    var post = e.post_processing;
    post.alignment.percentage = 100;
    post.alignment.by = hourly_employee;

    assert.equal(post.alignment.average, 64.09375, 'alignment average lookup');
    assert.equal(post.alignment.by, hourly_employee, 'hourly_employee doing alignment');

    assert.equal(e.post_processing_estimate().total_time, 769.125, 'time for post_processing by hourly employee');
    assert.equal(e.post_processing_estimate().total, 64.09375, 'total cost for post_processing');
    assert.equal(e.post_processing_estimate().salaried, 0, 'salary costs for post_processing review');
    assert.equal(e.post_processing_estimate().hourly, 64.09375, 'hourly costs for post_processing');

    post.background_removal.percentage = 100;
    post.background_removal.by = salaried_employee;

    assert.equal(e.post_processing_estimate().total_time, 1538.25, 'time for post_processing by hourly employee');
    assert.equal(e.post_processing_estimate().total, 128.1875, 'total cost for post_processing');
    assert.equal(e.post_processing_estimate().salaried, 64.09375, 'salary costs for post_processing');
    assert.equal(e.post_processing_estimate().hourly, 64.09375, 'hourly costs for post_processing');
});

QUnit.test("post_preparation_estimate", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);

    e.extent = 1200;
    e.capture_device = scanner;
    // TODO: Note: none of the post_preparation keys have any data...check on that
    var post_prep = e.post_preparation;
    post_prep.desorting.percentage = 100;
    post_prep.desorting.by = hourly_employee;

    assert.equal(post_prep.desorting.average, 0, 'desorting average lookup');
    assert.equal(post_prep.desorting.by, hourly_employee, 'hourly_employee doing desorting');

    assert.equal(e.post_preparation_estimate().total_time, 0, 'time for desorting by hourly employee');
    assert.equal(e.post_preparation_estimate().total, 0, 'total cost for desorting');
    assert.equal(e.post_preparation_estimate().salaried, 0, 'salary costs for desorting');
    assert.equal(e.post_preparation_estimate().hourly, 0, 'hourly costs for desorting');

    post_prep.refastening.percentage = 100;
    post_prep.refastening.by = salaried_employee;

    assert.equal(e.preparation_estimate().total_time, 0, 'time for condition_review by hourly employee');
    assert.equal(e.preparation_estimate().total, 0, 'total cost for condition review');
    assert.equal(e.preparation_estimate().salaried, 0, 'salary costs for condition review');
    assert.equal(e.preparation_estimate().hourly, 0, 'hourly costs for condition review');
});

QUnit.test("People Instantiation without hours", function( assert ){
    var person = new Person(0, '', 'hourly', 23, 23);
    assert.equal(person.hours_per_week, 40, "hours per week");
});

QUnit.test("calculate_hourly_rate", function( assert ) {
    var salary = 30000;
    var result = calculate_hourly_rate(salary);
    var result2 = calculate_hourly_rate(salary, 40);
    var result3 = calculate_hourly_rate(salary, 35);

    // hourly rate == (30000/52/40) 14.423076923
    assert.equal(result, 14.42, 'salary to hourly_rate without hours');
    // hourly rate with hours should equal without hours
    assert.equal(result2, result, 'salary to hourly_rate with hours');
    // hourly_rate == (30000/52/35) 16.483516484
    assert.equal(result3, 16.48, 'salary to hourly rate with 35 hours');
});

QUnit.test("metadata_creation estimate", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);

    e.extent = 1200;
    e.capture_device = scanner;
    e.metadata.level = 'level_1';
    e.metadata.by = hourly_employee;
    e.metadata.percentage = 100;

    assert.equal(e.metadata.level, 'level_1', 'metadata default level_1');
    assert.equal(e.metadata_estimate().total_time, 5796.3525714285715, 'level_1 quality control time');
    assert.equal(e.metadata_estimate().total, 71295.13662857143, 'level_1 metadata for hourly employee');

    e.metadata.by = salaried_employee;
    assert.equal(e.metadata_estimate().total, 178237.84157142858, 'level_1 metadata for salaried employee');

    e.metadata.percentage = 50;
    assert.equal(e.metadata_estimate().total_time, 2898.1762857142858, 'level_1 quality control time at 50%');
    assert.equal(e.metadata_estimate().total, 44559.460392857145, 'level_1 metadata at 50% of the collection');

    e.metadata.percentage = 100;
    e.metadata.level = 'level_2';
    assert.equal(e.metadata_estimate().total_time, 5796.3525714285715, 'level_2 quality control time');

    e.metadata.level = 'level_3';
    assert.equal(e.metadata_estimate().total_time, 5796.3525714285715, 'level_3 quality control time');

    e.metadata = 'foo'; // doesn't exist
    assert.equal(e.metadata_estimate().total_time, 0, 'quality control time for non-existant key');


});

QUnit.test("Test Other task assignment", function( assert ) {
    var e = $.extend(true, {}, blank_estimate);

    var task1 = { label: 'Test task', percentage: 50, by: hourly_employee, average: 20 };
    var task2 = { label: 'Test task2', percentage: 100, by: salaried_employee, average: 80 };

    e.extent = 1000;

    // add task1 to e (only one additional task)
    e.other_tasks.push(task1);
    // e.other_tasks[task1] = task1;
    // task 1 = extent * percentage * average * total hourly rate
    // (1000 / 100) * .5 * 20 * 12.3 == 1230 (cost)
    // (1000 / 100) * .5 * 20 == 100
    // console.log(hourly_employee);
    assert.equal(e.other_tasks_estimate().total_time, 100, 'Total Time estimate');
    assert.equal(e.other_tasks_estimate().total, 1230, 'Total cost estimate');
    assert.equal(e.other_tasks_estimate().salaried, 0, 'Total salaried cost estimate');
    assert.equal(e.other_tasks_estimate().hourly, 1230, 'Total hourly cost estimate');

    // add task2 to e (two tasks, salaried and hourly)
    // e.other_tasks[task2] = task2;
    // (1000 / 100) * 1 * 80 * 30.75 == 24600 (cost)
    // (1000 / 100) * 1 * 80  == 800 (time)
    assert.equal(e.other_tasks_estimate().total_time, 900, 'Total Time estimate');
    assert.equal(e.other_tasks_estimate().total, 25830, 'Total cost estimate');
    assert.equal(e.other_tasks_estimate().salaried, 24600, 'Total salaried cost estimate');
    assert.equal(e.other_tasks_estimate().hourly, 1230, 'Total hourly cost estimate');

    console.log('other tasks', e.other_tasks);
    console.log('keys in other tasks', Object.keys(e.other_tasks));

});

QUnit.test("Hourly person properties", function( assert ){
    var person = new Person(0, 'Thomas Jefferson', 'hourly', 23, 23, 40);
    var person2 = new Person(1, 'Thomas Jefferson', 'hourly', 23, 23, 35);

    assert.equal(person.id, 0, 'id is 0');
    assert.equal(person.name, 'Thomas Jefferson', 'Name property');
    assert.equal(person.type, 'hourly', 'hourly property');
    assert.equal(person.rate, 23, 'rate property');
    assert.equal(person.benefits_percent, 0.23, 'benefits_percent property');
    assert.equal(person.slug, 'thomas-jefferson', 'slug property');

    assert.equal(person.hours_per_week, 40, 'hours property omitted'); // optional param
    assert.equal(person2.hours_per_week, 35, 'hours property set');

    // .23 * 23 == 5.29
    assert.equal(person.hourly_benefits, 5.29, 'hourly benefits');
    // 5.29 + 23 == 28.29
    assert.equal(person.total_hourly_rate, 28.29, 'total hourly rate');
    assert.equal(person.total_minute_rate, 0.47, 'total per-minute rate');
});

QUnit.test("Salaried person properties", function(assert){
    var person = new Person(0, 'Thomas Jefferson', 'salaried', 30000, 23);

    assert.equal(person.rate, 14.42, 'salaried hourly rate');
    // 14.42 * .23 == 3.32
    assert.equal(person.hourly_benefits, 3.32, 'salaried hourly benefits');
    // 14.42 + 3.32 == 17.7366
    assert.equal(person.total_hourly_rate, 17.74, 'salaried total hourly rate');
});

QUnit.test("Test unsupported Person type (not salaried|hourly)", function(assert){
    var person = new Person(0, 'Thomas Jefferson', 'under the table', 23, 23);
    assert.equal(person.rate, 23);
    assert.equal(person.type, 'under the table');
    assert.equal(person.hours_per_week, 40);
});

QUnit.test("Utilities", function( assert ) {
    var test_string = 'this is a Test strinG';
    var number = 23, number2 = 2000, number3 = 2.23344;
    assert.equal(test_string.toProperCase(), 'This Is A Test String', 'Proper case');
    assert.equal(test_string.sluggify(), 'this-is-a-test-string', 'test_string to slug');
    assert.equal(number.formatCurrency(), '23.00');
    assert.equal(number2.formatCurrency(), '2,000.00');
    assert.equal(number3.formatCurrency(), '2.23');
    assert.ok(test_string.includes('Test'), 'test_string includes "Test"');
    assert.notOk(test_string.includes('string'), 'test_string does not include "string"');
});
