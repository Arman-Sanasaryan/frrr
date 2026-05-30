import React, { useState } from 'react';

const walletAddresses = {
  bitcoin: 'bc1qexampleaddress1234567890abcdef',
  ethereum: '0xExampleEthereumAddress1234567890abcdef',
  usdt: 'TExampleTetherAddress1234567890abcdef',
};

const Checkout = () => {
  const [crypto, setCrypto] = useState('bitcoin');
  const [amount, setAmount] = useState('0.00');
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const address = walletAddresses[crypto];
    setStatus(`Please send ${amount} ${crypto.toUpperCase()} to ${address}. Payment will be confirmed after the network transaction is verified.`);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Crypto Payment Checkout</h1>
      <p>Select your preferred cryptocurrency and complete the payment with your wallet.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label>
          Payment amount
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 8 }}
            min="0"
          />
        </label>

        <label>
          Cryptocurrency
          <select
            value={crypto}
            onChange={(event) => setCrypto(event.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 8 }}
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="usdt">USDT</option>
          </select>
        </label>

        <button type="submit" style={{ padding: '12px 16px', cursor: 'pointer' }}>
          Generate Payment Request
        </button>
      </form>

      {status && (
        <div style={{ marginTop: 24, padding: 16, background: '#f7f7f7', borderRadius: 8 }}>
          <h2>Payment Instructions</h2>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
};

export default Checkout;
