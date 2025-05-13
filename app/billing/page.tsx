'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CreditCard, Bitcoin, AlertCircle, ArrowRight, ChevronDown, ChevronUp, Download, Filter } from 'lucide-react'
import Button from '../components/Button'

// Mock transaction data
const mockTransactions = [
  {
    id: 'txn_1234567890',
    platform: 'Stripe',
    currency: 'USD',
    amount: 50,
    usdAmount: 50,
    status: 'completed',
    description: 'Account top-up',
    dateCreated: '2025-05-10T14:32:21Z',
    datePaid: '2025-05-10T14:32:45Z',
  },
  {
    id: 'txn_0987654321',
    platform: 'Bitcoin',
    currency: 'BTC',
    amount: 0.00125,
    usdAmount: 100,
    status: 'completed',
    description: 'Account top-up',
    dateCreated: '2025-05-05T09:15:33Z',
    datePaid: '2025-05-05T09:45:12Z',
  },
  {
    id: 'txn_5432167890',
    platform: 'Stripe',
    currency: 'USD',
    amount: 25,
    usdAmount: 25,
    status: 'completed',
    description: 'Account top-up',
    dateCreated: '2025-04-28T16:22:10Z',
    datePaid: '2025-04-28T16:22:35Z',
  },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const [amount, setAmount] = useState('50')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [autoTopUp, setAutoTopUp] = useState(false)
  const [showHistory, setShowHistory] = useState(true)
  
  // Calculate bonus based on amount
  const getBonus = () => {
    const numAmount = parseFloat(amount)
    if (numAmount >= 100) return 0.1 // 10%
    if (numAmount >= 50) return 0.05 // 5%
    return 0
  }
  
  const bonus = getBonus()
  const bonusAmount = parseFloat(amount) * bonus
  const totalAmount = parseFloat(amount) + bonusAmount

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Top Up & Auto Top Up */}
          <div className="lg:col-span-2">
            {/* Top Up Card */}
            <div className="card bg-bg-light rounded-lg shadow-lg p-6 border border-bg-light mb-8">
              <h2 className="text-xl font-semibold mb-6">Top Up Amount</h2>
              
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-bg-dark border border-bg-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    step="1"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-text-secondary mb-2">Payment Method</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center p-4 bg-bg-dark border border-bg-light rounded-md cursor-pointer transition-all duration-200 hover:border-primary/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-3 text-primary focus:ring-primary"
                    />
                    <CreditCard size={20} className="mr-2 text-text-secondary" />
                    <span>Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center p-4 bg-bg-dark border border-bg-light rounded-md cursor-pointer transition-all duration-200 hover:border-primary/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={() => setPaymentMethod('crypto')}
                      className="mr-3 text-primary focus:ring-primary"
                    />
                    <Bitcoin size={20} className="mr-2 text-text-secondary" />
                    <span>Cryptocurrency</span>
                  </label>
                </div>
              </div>
              
              {/* Bonus Display */}
              {bonus > 0 && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle size={20} className="text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-primary">Bonus Credit</h3>
                      <div className="mt-2 text-sm text-text-secondary">
                        <p>You'll receive a {bonus * 100}% bonus (${bonusAmount.toFixed(2)}) with this top-up.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-bg-dark/50 rounded-md">
                <div>
                  <p className="text-sm text-text-secondary">Total Amount</p>
                  <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  ariaLabel="Proceed to payment"
                  className="mt-4 sm:mt-0"
                >
                  Top Up Now
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
            
            {/* Auto Top Up Card */}
            <div className="card bg-bg-light rounded-lg shadow-lg p-6 border border-bg-light mb-8">
              <h2 className="text-xl font-semibold mb-6">Auto Top Up</h2>
              
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    id="autoTopUp"
                    type="checkbox"
                    checked={autoTopUp}
                    onChange={() => setAutoTopUp(!autoTopUp)}
                    className="h-4 w-4 text-primary focus:ring-primary border-bg-light rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="autoTopUp" className="font-medium text-text-primary">Enable Auto Top Up</label>
                  <p className="text-text-secondary">Automatically add funds to your account when your balance falls below $10.00</p>
                </div>
              </div>
              
              {autoTopUp && (
                <div className="bg-bg-dark/30 p-4 rounded-md">
                  <div className="mb-4">
                    <label htmlFor="autoAmount" className="block text-sm font-medium text-text-secondary mb-2">
                      Auto Top Up Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                      <input
                        type="number"
                        id="autoAmount"
                        defaultValue="50"
                        className="w-full pl-8 pr-4 py-2 bg-bg-dark border border-bg-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="10"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    ariaLabel="Save auto top up settings"
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Analytics */}
          <div className="lg:col-span-1">
            <div className="card bg-bg-light rounded-lg shadow-lg p-6 border border-bg-light mb-8">
              <h2 className="text-xl font-semibold mb-6">Analytics</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-text-secondary">Spent Today</p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
                
                <div>
                  <p className="text-sm text-text-secondary">Rolling Average (7 days)</p>
                  <p className="text-2xl font-bold">$0.00/day</p>
                </div>
                
                <div>
                  <p className="text-sm text-text-secondary">Current Hourly Spend</p>
                  <p className="text-2xl font-bold">$0.00/hr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Billing History */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Billing History</h2>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-dark"
            >
              {showHistory ? (
                <>
                  <ChevronUp size={20} className="mr-1" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown size={20} className="mr-1" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          
          {showHistory && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    ariaLabel="Filter transactions"
                    className="mr-2"
                  >
                    <Filter size={14} className="mr-1" />
                    Filter
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  ariaLabel="Download transaction history"
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                <table className="min-w-full divide-y divide-bg-light">
                  <thead className="bg-bg-light/30">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Platform
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Currency
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        USD Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Date Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Date Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-dark divide-y divide-bg-light/20">
                    {mockTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-bg-light/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.currency === 'BTC' 
                            ? transaction.amount.toFixed(8) 
                            : `$${transaction.amount.toFixed(2)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${transaction.usdAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(transaction.dateCreated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(transaction.datePaid)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {mockTransactions.length === 0 && (
                <div className="text-center py-12 bg-bg-light/5 rounded-md">
                  <p className="text-text-secondary">No transaction history available.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
