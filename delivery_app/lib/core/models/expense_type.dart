class ExpenseType {
  final String name;
  final String label;

  ExpenseType(this.name, this.label);

  static List<ExpenseType> commonTypes = [
    ExpenseType('fuel', 'وقود'),
    ExpenseType('maintenance', 'صيانة'),
    ExpenseType('fees', 'رسوم'),
    ExpenseType('parking', 'موقف سيارات'),
    ExpenseType('other', 'أخرى'),
  ];
} 