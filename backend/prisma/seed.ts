// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seed...');

  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@demo.com' },
    update: { password },
    create: { nom: 'Diop', prenom: 'Awa', email: 'admin@demo.com', password, role: 'ADMINISTRATEUR' },
  });

  const manager = await prisma.utilisateur.upsert({
    where: { email: 'manager@demo.com' },
    update: { password },
    create: { nom: 'Ndiaye', prenom: 'Moussa', email: 'manager@demo.com', password, role: 'MANAGER' },
  });

  const collaborateur = await prisma.utilisateur.upsert({
    where: { email: 'collab@demo.com' },
    update: { password },
    create: { nom: 'Fall', prenom: 'Fatou', email: 'collab@demo.com', password, role: 'COLLABORATEUR' },
  });

  const existingTasksCount = await prisma.tache.count({
    where: { createurId: collaborateur.id },
  });

  if (existingTasksCount === 0) {
    await prisma.tache.createMany({
      data: [
        {
          titre: 'Rédiger le rapport mensuel',
          description: "Préparer le rapport d'activité du mois pour la direction.",
          statut: 'BROUILLON',
          createurId: collaborateur.id,
        },
        {
          titre: 'Mettre à jour la documentation API',
          description: 'Compléter la documentation avec les nouveaux endpoints.',
          statut: 'SOUMISE',
          createurId: collaborateur.id,
        },
        {
          titre: 'Corriger le bug de connexion',
          description: 'Le bouton de connexion ne répond pas sur mobile.',
          statut: 'VALIDEE',
          createurId: collaborateur.id,
        },
      ],
    });
    console.log('Tâches de démonstration créées.');
  } else {
    console.log('Tâches de démonstration déjà présentes, aucune création.');
  }

  console.log('Seed terminé avec succès ✓');
  console.log(`
Comptes disponibles :
ADMINISTRATEUR
email : admin@demo.com
MANAGER
email : manager@demo.com
COLLABORATEUR
email : collab@demo.com
Mot de passe commun :
Password123!
`);
}

main()
  .catch((error) => {
    console.error('Erreur seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
