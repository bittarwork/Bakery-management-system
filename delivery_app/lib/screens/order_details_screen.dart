import 'package:flutter/material.dart';
import '../models/order_model.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class OrderDetailsScreen extends StatelessWidget {
  final OrderModel order;
  const OrderDetailsScreen({Key? key, required this.order}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تفاصيل الطلب'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('رقم الطلب: ${order.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              Table(
                border: TableBorder.all(color: Colors.grey),
                columnWidths: const {
                  0: IntrinsicColumnWidth(),
                  1: FlexColumnWidth(),
                },
                children: [
                  TableRow(children: [
                    const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('اسم المخبوزات', style: TextStyle(fontWeight: FontWeight.bold)))),
                    TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.bakeryName))),
                  ]),
                  TableRow(children: [
                    const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('الكمية', style: TextStyle(fontWeight: FontWeight.bold)))),
                    TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.quantity.toString()))),
                  ]),
                  TableRow(children: [
                    const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('اسم الفرع', style: TextStyle(fontWeight: FontWeight.bold)))),
                    TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.branchName))),
                  ]),
                  TableRow(children: [
                    const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('عنوان الفرع', style: TextStyle(fontWeight: FontWeight.bold)))),
                    TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.branchAddress))),
                  ]),
                  TableRow(children: [
                    const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('هاتف الفرع', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)))),
                    TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.branchPhone, style: TextStyle(color: Colors.blue)))),
                  ]),
                  if (order.paymentMethod != null)
                    TableRow(children: [
                      const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('طريقة الدفع', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)))),
                      TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(order.paymentMethod!, style: TextStyle(color: Colors.green)))),
                    ]),
                ],
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final pdf = pw.Document();
                        pdf.addPage(
                          pw.Page(
                            build: (pw.Context context) => pw.Column(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text('فاتورة تسليم الطلب', style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold)),
                                pw.SizedBox(height: 16),
                                pw.Text('رقم الطلب: ${order.id}'),
                                pw.Table(
                                  border: pw.TableBorder.all(),
                                  children: [
                                    pw.TableRow(children: [
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text('اسم المخبوزات', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                      ),
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text(order.bakeryName),
                                      ),
                                    ]),
                                    pw.TableRow(children: [
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text('الكمية', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                      ),
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text(order.quantity.toString()),
                                      ),
                                    ]),
                                    pw.TableRow(children: [
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text('اسم الفرع', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                      ),
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text(order.branchName),
                                      ),
                                    ]),
                                    pw.TableRow(children: [
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text('عنوان الفرع', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                      ),
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text(order.branchAddress),
                                      ),
                                    ]),
                                    pw.TableRow(children: [
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text('هاتف الفرع', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                      ),
                                      pw.Padding(
                                        padding: const pw.EdgeInsets.all(8),
                                        child: pw.Text(order.branchPhone),
                                      ),
                                    ]),
                                    if (order.paymentMethod != null)
                                      pw.TableRow(children: [
                                        pw.Padding(
                                          padding: const pw.EdgeInsets.all(8),
                                          child: pw.Text('طريقة الدفع', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                                        ),
                                        pw.Padding(
                                          padding: const pw.EdgeInsets.all(8),
                                          child: pw.Text(order.paymentMethod!),
                                        ),
                                      ]),
                                  ],
                                ),
                                pw.SizedBox(height: 24),
                                pw.Text('تم التسليم بواسطة: ________________'),
                                pw.SizedBox(height: 12),
                                pw.Text('توقيع المستلم: ________________'),
                              ],
                            ),
                          ),
                        );
                        await Printing.layoutPdf(
                          onLayout: (format) async => pdf.save(),
                        );
                      },
                      icon: const Icon(Icons.print),
                      label: const Text('طباعة الفاتورة'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
} 