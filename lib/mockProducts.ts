export const mockTextbooks = [
  { id: 'tb-1', name: 'Engineering Physics (8th Ed) - Highlighted', price: '450', originalPrice: '1200', discount: '62%', seller: 'Rahul S.', condition: 'Used - Good', emoji: '📘', color: '#102a43', description: 'Comprehensive guide covering quantum mechanics, solid state physics, and optics. Contains some highlights from previous exams. Perfect for Sem 3 engineering students.' },
  { id: 'tb-2', name: 'Data Structures and Algorithms in C++', price: '300', originalPrice: '850', discount: '64%', seller: 'Priya K.', condition: 'Like New', emoji: '📙', color: '#842029', description: 'Essential textbook for cracking coding interviews. Covers arrays, trees, graphs, and dynamic programming in C++. Barely used, almost brand new condition.' },
  { id: 'tb-3', name: 'Microeconomics Principles', price: '250', originalPrice: '700', discount: '64%', seller: 'Amit V.', condition: 'Acceptable', emoji: '📗', color: '#0f5132', description: 'Standard textbook for introductory economics. Has some bent pages but all text is perfectly readable. A highly affordable option.' },
  { id: 'tb-4', name: 'Organic Chemistry Vol. 2', price: '500', originalPrice: '1500', discount: '66%', seller: 'Neha R.', condition: 'Used - Very Good', emoji: '📕', color: '#664d03', description: 'In-depth coverage of reaction mechanisms. Crucial for advanced chemistry courses. Well-maintained without any torn pages.' }
];

export const mockElectronics = [
  { id: 'el-1', name: 'Casio fx-991EX Scientific Calculator', price: '600', originalPrice: '1350', discount: '55%', seller: 'Vikas T.', condition: 'Like New', emoji: '🖩', color: '#052c65', description: 'Industry standard for engineering mathematics. Works flawlessly and includes original cover. Pre-approved for use in university examinations.' },
  { id: 'el-2', name: 'Arduino Uno R3 Starter Kit', price: '800', originalPrice: '2000', discount: '60%', seller: 'Samir D.', condition: 'Used - Good', emoji: '🔌', color: '#1a1d20', description: 'Complete kit including breadboard, jumper wires, LEDs, and resistors. Only used for one semester project. All components tested and working.' },
  { id: 'el-3', name: 'Drafting Table Tool Set (Mini-drafter)', price: '200', originalPrice: '600', discount: '66%', seller: 'Ankit M.', condition: 'Used - Acceptable', emoji: '📐', color: '#332701', description: 'Standard mini-drafter required for engineering graphics course. Joints are slightly loose but can be tightened. Good enough to get you through the semester.' },
  { id: 'el-4', name: 'Lab Coat (Size M) + Goggles', price: '150', originalPrice: '450', discount: '66%', seller: 'Riya G.', condition: 'Used - Washed', emoji: '🥼', color: '#000000', description: 'Standard white cotton lab coat with safety goggles. Washed thoroughly. Perfect for chemistry and bio labs.' }
];

export const allMockProducts = [...mockTextbooks, ...mockElectronics];

// Helper to get a product by ID
export function getMockProductById(id: string) {
  return allMockProducts.find(p => p.id === id);
}
