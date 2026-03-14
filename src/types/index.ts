// Tipos do AngraFit Trainer

export interface Client {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: 'hipertrofia' | 'emagrecimento' | 'resistencia' | 'condicionamento';
  level: 'iniciante' | 'intermediario' | 'avancado';
  gender: 'masculino' | 'feminino';
  plan: string;
  startDate: string;
  dueDate: string;
  photo?: string;
  observations: string;
  password: string;
  status: 'ativo' | 'inativo' | 'pendente';
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  restTime: number;
}

export interface Workout {
  id: string;
  clientId: string;
  name: string;
  dayOfWeek: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  foods: Food[];
}

export interface Food {
  id: string;
  name: string;
  quantity: string;
  observations: string;
}

export interface Diet {
  id: string;
  clientId: string;
  name: string;
  meals: Meal[];
  createdAt: string;
}

export interface Message {
  id: string;
  clientId: string;
  title: string;
  content: string;
  type: 'aviso' | 'instrucao' | 'lembrete' | 'motivacional';
  date: string;
  read: boolean;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pago' | 'pendente' | 'atrasado' | 'aguardando_confirmacao';
  method: 'pix' | 'link' | 'dinheiro' | 'outro';
  pixKey?: string;
  paymentLink?: string;
  description: string;
}

export interface Schedule {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  notes: string;
}

export interface Progress {
  id: string;
  clientId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

export interface AppSettings {
  gymName: string;
  gymLogo?: string;
  gymAddress: string;
  gymPhone: string;
  gymEmail: string;
  primaryColor: string;
  pdfHeader: string;
  pdfFooter: string;
}

export type UserType = 'admin' | 'client' | null;

export interface AuthState {
  isAuthenticated: boolean;
  userType: UserType;
  userId: string | null;
  userName: string | null;
}

export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombro',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Glúteos',
  'Cardio'
] as const;

export const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
] as const;

export const MEAL_TYPES = [
  'Café da Manhã',
  'Lanche da Manhã',
  'Almoço',
  'Lanche da Tarde',
  'Pré-treino',
  'Pós-treino',
  'Jantar',
  'Ceia'
] as const;

export const EXERCISE_DATABASE: Record<string, string[]> = {
  'Peito': [
    'Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo', 
    'Crucifixo Inclinado', 'Pullover', 'Flexão', 'Flexão Diamond',
    'Supino com Halteres', 'Press Peito Máquina', 'Crossover', 'Peck Deck'
  ],
  'Costas': [
    'Puxada Frontal', 'Puxada Atrás', 'Remada Curvada', 'Remada Unilateral',
    'Remada Cavalinho', 'Remada Baixa', 'Remada Alta', 'Levantamento Terra',
    'Pulldown', 'Barra Fixa', 'Remada Máquina', 'Good Morning'
  ],
  'Pernas': [
    'Agachamento', 'Agachamento Frontal', 'Agachamento Búlgaro', 'Leg Press',
    'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Afundo',
    'Hack Squat', 'Sumô Squat', 'Panturrilha em Pé', 'Panturrilha Sentado'
  ],
  'Ombro': [
    'Desenvolvimento com Halteres', 'Desenvolvimento Militar', 'Desenvolvimento Arnold',
    'Elevação Lateral', 'Elevação Frontal', 'Elevação Posterior', 'Remada Alta',
    'Desenvolvimento Máquina', 'Crucifixo Invertido', 'Face Pull'
  ],
  'Bíceps': [
    'Rosca Direta', 'Rosca Alternada', 'Rosca Martelo', 'Rosca Scott',
    'Rosca Concentrada', 'Rosca Inclinada', 'Rosca Corda', 'Rosca 21',
    'Rosca Spider', 'Rosca com Barra W'
  ],
  'Tríceps': [
    'Tríceps Corda', 'Tríceps Francês', 'Tríceps Testa', 'Tríceps Pulley',
    'Tríceps Banco', 'Mergulho', 'Tríceps Máquina', 'Tríceps Kickback',
    'Tríceps Diamond', 'Tríceps Unilateral'
  ],
  'Abdômen': [
    'Crunch', 'Crunch Inclinado', 'Prancha', 'Prancha Lateral',
    'Elevação de Pernas', 'Russian Twist', 'Bicicleta', 'Mountain Climber',
    'Abdominal Máquina', 'Hanging Leg Raise'
  ],
  'Glúteos': [
    'Hip Thrust', 'Glute Bridge', 'Elevação Pélvica', 'Sumô Deadlift',
    'Donkey Kick', 'Fire Hydrant', 'Glute Kickback', 'Step Up',
    'Lunges Reverso', 'Ponte de Glúteos'
  ],
  'Cardio': [
    'Corrida', 'Caminhada', 'Bicicleta', 'Elíptico',
    'Remo', 'Pular Corda', 'Burpees', 'Jumping Jacks',
    'Mountain Climbers', 'High Knees', 'Sprint', 'Subir Escadas'
  ]
};

export const FOOD_DATABASE = [
  'Peito de Frango', 'Carne Vermelha Magra', 'Peixe', 'Ovos',
  'Arroz Branco', 'Arroz Integral', 'Batata Doce', 'Batata',
  'Aveia', 'Pão Integral', 'Macarrão', 'Quinoa',
  'Brócolis', 'Espinafre', 'Alface', 'Tomate',
  'Banana', 'Maçã', 'Morango', 'Uva',
  'Amendoim', 'Castanhas', 'Azeite', 'Óleo de Coco',
  'Whey Protein', 'Creatina', 'BCAA', 'Glutamina',
  'Leite', 'Iogurte', 'Queijo Cottage', 'Requeijão Light'
];
