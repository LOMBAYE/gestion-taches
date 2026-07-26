import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });