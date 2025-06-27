import React from 'react';
import { Order } from '../../../types/oms';

interface OrderSlipPrintProps {
  order: Order;
  customer: any;
  onClose: () => void;
}

const OrderSlipPrint: React.FC<OrderSlipPrintProps> = ({ order, customer, onClose }) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Function to print the slip
  const handlePrint = () => {
    const printContent = document.getElementById('order-slip');
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Order Slip</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Order Slip */}
        <div id="order-slip" className="p-6">
          <div className="border border-gray-300 p-4 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
              <div className="border border-gray-300 rounded-lg p-2">
                <h1 className="text-lg font-bold">Homdrai,</h1>
                <p className="text-sm">Trusted Tailor</p>
              </div>
              <div className="text-right">
                <p className="font-bold">ORIGINAL COPY</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><span className="font-medium">Order no:</span> {order.id}</p>
                <p><span className="font-medium">Name:</span> {customer?.name}</p>
                <p><span className="font-medium">Address:</span> {customer?.address.city}, {customer?.address.state}</p>
              </div>
              <div>
                <p><span className="font-medium">Date:</span> {formatDate(order.orderDate)}</p>
                <p><span className="font-medium">Mobile:</span> {customer?.phone}</p>
                <p><span className="font-medium">Item Ordered:</span> {order.garmentType}</p>
              </div>
            </div>

            {/* Measurements */}
            <div className="mb-4">
              <div className="border border-gray-300">
                <div className="border-b border-gray-300 p-2 text-center font-bold bg-gray-100">
                  Measurements Top
                </div>
                <div className="grid grid-cols-4">
                  {/* Top Measurements - Row 1 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">FL</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.FL || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">SH</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.SH || ''}</div>
                </div>
                <div className="grid grid-cols-4">
                  {/* Top Measurements - Row 2 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">SR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.SR || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">MR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.MR || ''}</div>
                </div>
                <div className="grid grid-cols-4">
                  {/* Top Measurements - Row 3 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">CH</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.CH || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">BR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.BR || ''}</div>
                </div>
                <div className="grid grid-cols-4">
                  {/* Top Measurements - Row 4 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">HIP</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.HIP || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">SLIT</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.SLIT || ''}</div>
                </div>
                <div className="grid grid-cols-4">
                  {/* Top Measurements - Row 5 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">BN</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.BN || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">DP</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.top.DP || ''}</div>
                </div>
                
                {/* Bottom Measurements */}
                <div className="border-t border-gray-300 p-2 text-center font-bold bg-gray-100">
                  Bottom Measurements
                </div>
                <div className="grid grid-cols-4">
                  {/* Bottom Measurements - Row 1 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">FL</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.bottom.FL || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">WR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.bottom.WR || ''}</div>
                </div>
                <div className="grid grid-cols-4">
                  {/* Bottom Measurements - Row 2 */}
                  <div className="border border-gray-300 p-2 text-center font-medium">TR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.bottom.TR || ''}</div>
                  <div className="border border-gray-300 p-2 text-center font-medium">LR</div>
                  <div className="border border-gray-300 p-2">{order.measurements?.bottom.LR || ''}</div>
                </div>
              </div>
              
              {/* Fabric Swatch and Notes */}
              <div className="flex mt-4">
                <div className="flex-1">
                  {order.measurements?.notes && (
                    <div>
                      <p className="font-medium">Notes</p>
                      <div className="border border-gray-300 border-dashed rounded-lg p-2 min-h-[100px]">
                        {order.measurements.notes}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4 w-1/3">
                  <div className="border-2 border-gray-300 rounded-full p-4 text-center">
                    <p>Attach Fabric Swatch</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><span className="font-medium">Total Bill:</span> {formatCurrency(order.totalAmount)}</p>
                <p><span className="font-medium">Advanced Paid:</span> {formatCurrency(order.advancePaid)}</p>
                <p><span className="font-medium">Balance:</span> {formatCurrency(order.balanceAmount)}</p>
              </div>
              <div>
                <p><span className="font-medium">Advanced Date:</span> {formatDate(order.advancePaidDate)}</p>
                <p><span className="font-medium">Balance Paid Date:</span> {formatDate(order.balancePaidDate)}</p>
                <p>
                  <span className="font-medium">Delivery:</span> 
                  <span className="ml-2">
                    <input type="checkbox" checked={order.status === 'delivered'} readOnly className="mr-1" />Yes
                    <input type="checkbox" checked={order.status !== 'delivered'} readOnly className="ml-2 mr-1" />No
                  </span>
                </p>
              </div>
            </div>

            {/* Expected Delivery Date */}
            <div className="mb-4">
              <p><span className="font-medium">EDC:</span> {formatDate(order.expectedDeliveryDate)}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-300 text-sm">
              <div>
                <p>Maliakkapady</p>
                <p>683561</p>
              </div>
              <div className="text-right">
                <p>9567199924</p>
                <p>homdrai.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSlipPrint;