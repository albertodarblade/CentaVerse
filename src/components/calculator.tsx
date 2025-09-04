'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CalculatorProps {
  onConfirm: (value: number) => void;
}

export default function Calculator({ onConfirm }: CalculatorProps) {
  const [input, setInput] = useState('');
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);

  const handleNumberClick = (value: string) => {
    setInput((prev) => prev + value);
  };

  const handleOperatorClick = (op: string) => {
    if (input === '') return;
    if (previousInput !== null) {
      handleEquals();
    }
    setOperator(op);
    setPreviousInput(input);
    setInput('');
  };

  const handleEquals = () => {
    if (previousInput === null || operator === null || input === '') return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(input);
    let result;

    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = prev / current;
        break;
      default:
        return;
    }

    setInput(result.toString());
    setOperator(null);
    setPreviousInput(null);
  };

  const handleClear = () => {
    setInput('');
    setPreviousInput(null);
    setOperator(null);
  };

  const handleConfirm = () => {
    const value = parseInt(input, 10);
    if (!isNaN(value)) {
      onConfirm(value);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <div>
        <div className="p-4 space-y-4">
            <Input
                type="text"
                value={input}
                readOnly
                className="text-right text-3xl font-mono h-16"
                placeholder="0"
            />
            <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="col-span-2 h-16 text-xl" onClick={handleClear}>C</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={handleEquals}>=</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleOperatorClick('+')}>+</Button>
                
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('7')}>7</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('8')}>8</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('9')}>9</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleOperatorClick('-')}>-</Button>

                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('4')}>4</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('5')}>5</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('6')}>6</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleOperatorClick('*')}>*</Button>
                
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('1')}>1</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('2')}>2</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleNumberClick('3')}>3</Button>
                <Button variant="outline" className="h-16 text-xl" onClick={() => handleOperatorClick('/')}>/</Button>

                <Button variant="outline" className="col-span-3 h-16 text-xl" onClick={() => handleNumberClick('0')}>0</Button>
            </div>
            <Button className="w-full h-14 text-lg" onClick={handleConfirm}>Confirmar Monto</Button>
        </div>
    </div>
  );
}
