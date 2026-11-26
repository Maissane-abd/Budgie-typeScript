export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
  links?: { label: string; href: string }[];
}

export interface LegalPage {
  path: string;
  name: string;
  title: string;
  description: string;
  sections: LegalSection[];
}

export const legalContact = {
  name: 'Maïssane ABDALLAH',
  status: 'Particulier',
  location: 'Paris, France',
  email: 'abd.maissane@gmail.com',
};

// Keep this status until the operational details and the full text have been reviewed.
export const legalReview = {
  status: 'draft',
  updatedAt: '2026-11-26',
  updatedLabel: '26 novembre 2026',
  label: 'Version de travail — en cours de validation',
  pending: [
    // 'Coordonnées légales complètes de l’éditeur et responsable de publication.',
    // 'Identité et coordonnées exactes de l’hébergeur, pays de stockage et transferts éventuels.',
    // 'Durées et modalités de conservation des comptes inactifs, journaux, courriels et sauvegardes.',
    // 'Vérification du service déployé et relecture de l’ensemble des textes par un professionnel du droit.',
  ],
} as const;

export const legalPages: LegalPage[] = [
  {
    path: '/mentions-legales',
    name: 'legal-notice',
    title: 'Mentions légales',
    description: 'Identité de l’éditeur de Budgie, hébergement et coordonnées de contact.',
    sections: [
      {
        id: 'editeur',
        title: 'Éditeur du service',
        paragraphs: [
          `Le site monbudgie.fr et le service Budgie sont édités par ${legalContact.name}, à titre de particulier, à ${legalContact.location}.`,
          'L’adresse postale complète, les autres coordonnées légalement requises et l’identité du responsable de publication restent à confirmer avant validation définitive. La mention « Paris, France » ne constitue pas une adresse postale complète.',
        ],
      },
      {
        id: 'service',
        title: 'Objet du site',
        paragraphs: [
          'Budgie est un outil de gestion de budget personnel. Il permet de saisir manuellement des comptes financiers, des revenus et des dépenses, puis de consulter des prévisions calculées à partir de ces informations.',
          'Budgie ne se connecte pas à votre banque et ne réalise aucun paiement ni virement. Ses estimations ne constituent pas un conseil financier personnalisé.',
        ],
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        paragraphs: [
          'L’hébergement annoncé pour Budgie est un serveur privé virtuel chez OVHcloud. L’entité contractante, son adresse, son numéro de téléphone et les lieux effectifs de stockage restent à confirmer.',
          'Ces informations doivent être complétées à partir du contrat d’hébergement avant de considérer ces mentions comme définitives.',
        ],
      },
      {
        id: 'contenus-et-code',
        title: 'Contenus du site et code source',
        paragraphs: [
          'Les présentes pages concernent l’utilisation du service accessible sur monbudgie.fr. La documentation technique et les conditions de la licence du code source ont un objet distinct.',
          'La licence indiquée dans le dépôt du projet précise les droits relatifs au code concerné. Elle n’autorise pas l’accès aux comptes ni aux données personnelles des utilisateurs et ne remplace pas les présentes informations sur le service.',
        ],
      },
    ],
  },
  {
    path: '/politique-de-confidentialite',
    name: 'privacy-policy',
    title: 'Politique de confidentialité',
    description:
      'Données personnelles et financières utilisées par Budgie, compte, conservation et droits.',
    sections: [
      {
        id: 'responsable',
        title: 'Responsable et périmètre',
        paragraphs: [
          `${legalContact.name}, particulier à ${legalContact.location}, est le point de contact et le responsable du traitement des données du service Budgie. Le contact pour la confidentialité est ${legalContact.email}.`,
          'Cette politique concerne le site monbudgie.fr, votre espace personnel et les échanges avec le support. Elle est distincte des conditions d’utilisation et de la documentation du code source.',
        ],
      },
      {
        id: 'donnees',
        title: 'Quelles données sont utilisées ?',
        paragraphs: [
          'Les données de budget proviennent de votre saisie manuelle. Aucune connexion bancaire n’est utilisée pour les récupérer.',
        ],
        items: [
          'Compte utilisateur : prénom, nom, adresse e-mail, identifiant interne, empreinte du mot de passe et dates de création et de modification. Le mot de passe est haché avant son stockage.',
          'Comptes financiers : nom et description, devise, solde renseigné, date de départ et, lorsqu’ils sont renseignés, taux d’intérêt et taux fiscal.',
          'Revenus et dépenses : libellés, descriptions, montants, dates, compte associé et règles de récurrence. Les prévisions et les totaux sont calculés à partir de ces informations.',
          'Connexion et fonctionnement : jeton d’authentification dans le navigateur, informations de requête et d’erreur dans les journaux techniques. Ces journaux peuvent comprendre une adresse IP, un identifiant de compte ou une adresse e-mail.',
          'Contact : adresse e-mail et contenu des messages que vous adressez au support.',
        ],
      },
      {
        id: 'collecte',
        title: 'Informations nécessaires et champs libres',
        paragraphs: [
          'Le prénom, le nom, l’adresse e-mail et le mot de passe sont obligatoires pour créer un compte. Sans ces informations, l’inscription ne peut pas aboutir. Les montants, dates et autres champs obligatoires des comptes et opérations sont nécessaires aux fonctions correspondantes. Les descriptions sont facultatives.',
          'Ne saisissez pas d’identifiants bancaires, de mots de passe de banque, de numéros de carte ou de justificatifs dans les descriptions. Évitez les informations inutiles sur votre santé, vos convictions ou d’autres personnes : un libellé libre peut révéler des informations particulièrement privées.',
        ],
      },
      {
        id: 'finalites',
        title: 'À quoi servent ces données ?',
        paragraphs: [
          'La création et la gestion du compte, l’authentification, l’enregistrement du budget et le calcul des prévisions servent à fournir le service que vous demandez. La base légale retenue pour ces fonctions est l’exécution du contrat d’utilisation du service, y compris les démarches nécessaires à sa création (article 6, paragraphe 1, b du RGPD).',
          'La protection des accès et le diagnostic des erreurs répondent à l’intérêt légitime de maintenir la sécurité et le fonctionnement du service (article 6, paragraphe 1, f du RGPD). Le périmètre des journaux et cette justification doivent encore être validés et documentés.',
          'Les messages de support sont utilisés pour répondre à votre demande : exécution du service pour une demande liée au compte, ou intérêt légitime à répondre aux autres questions. Les demandes d’exercice de droits sont traitées pour respecter les obligations du RGPD (article 6, paragraphe 1, c).',
          'Les prévisions sont des calculs indicatifs destinés à votre consultation. Budgie ne les utilise pas pour prendre une décision d’octroi de crédit ou une autre décision produisant un effet juridique à votre égard.',
        ],
      },
      {
        id: 'destinataires',
        title: 'Qui peut accéder aux données ?',
        paragraphs: [
          'Les données de votre espace ne sont pas publiées sur le site. Leur traitement implique l’éditeur pour l’exploitation et l’assistance, ainsi que le prestataire d’hébergement dans le cadre de ses missions techniques.',
          'L’hébergement annoncé est OVHcloud. Les messages adressés au contact transitent également par son fournisseur de messagerie, Gmail (Google). La liste complète des prestataires, leurs conditions d’accès, les pays de stockage et les éventuels transferts hors de l’Espace économique européen et leurs garanties restent à vérifier.',
          'Les coordonnées de l’hébergeur et les informations sur les transferts devront être précisées avant la validation définitive de cette politique.',
        ],
      },
      {
        id: 'conservation',
        title: 'Conservation et suppression',
        paragraphs: [
          'Dans la version actuelle, les données du compte et du budget restent dans la base active jusqu’à la suppression du compte ou des éléments concernés. Aucune purge automatique des comptes inactifs n’est actuellement définie. Une règle d’inactivité et sa mise en œuvre doivent être fixées avant validation définitive.',
          'Depuis votre profil, vous pouvez modifier votre prénom, votre nom et votre e-mail, puis demander la suppression de votre compte avec confirmation. La suppression du compte entraîne celle des comptes financiers, opérations et récurrences associés dans la base active. La déconnexion seule ne supprime pas votre compte ni votre budget.',
          'Les durées des journaux techniques, des échanges par e-mail et des éventuelles sauvegardes, ainsi que les modalités de purge de ces dernières, restent à préciser. La suppression dans la base active ne vaut pas garantie d’effacement immédiat dans ces autres supports.',
          'Aucune conservation supplémentaire pour une obligation légale ne sera présentée comme nécessaire sans en préciser le fondement, les données concernées et la durée applicable.',
        ],
      },
      {
        id: 'stockage-navigateur',
        title: 'Stockage dans votre navigateur',
        paragraphs: [
          'Après connexion, un jeton nommé « budgie_token » est enregistré dans le stockage local de votre navigateur (localStorage) pour authentifier vos requêtes. Il contient un identifiant de compte et une adresse e-mail. Sa durée de validité est d’un jour ; son expiration ne supprime pas automatiquement la valeur stockée dans le navigateur.',
          'La déconnexion retire ce jeton du navigateur. Vous pouvez aussi l’effacer dans les données du site de votre navigateur ; vous devrez alors vous reconnecter. Sur un appareil partagé, déconnectez-vous après utilisation.',
          'Ce stockage sert à l’authentification demandée et est strictement nécessaire à cette fonction. L’application examinée n’intègre pas de traceur publicitaire ni de mesure d’audience. La configuration du site déployé doit encore être vérifiée pour confirmer ce périmètre.',
        ],
      },
      {
        id: 'securite',
        title: 'Protection des données',
        paragraphs: [
          'Le service prévoit des accès authentifiés aux espaces personnels, le hachage des mots de passe et des échanges HTTPS en production. Ces mesures réduisent les risques sans garantir une sécurité absolue.',
          'Aucun chiffrement de bout en bout des données financières n’est annoncé. Conservez vos propres relevés et évitez d’envoyer des informations financières détaillées par e-mail.',
        ],
      },
      {
        id: 'droits',
        title: 'Vos droits et leur exercice',
        paragraphs: [
          'Dans les conditions prévues par le RGPD, vous disposez de droits d’accès, de rectification, d’effacement et de limitation du traitement. Vous pouvez demander la portabilité des données fournies lorsque les conditions sont réunies et vous opposer, pour des raisons tenant à votre situation particulière, aux traitements fondés sur l’intérêt légitime.',
          `Pour exercer un droit ou poser une question, écrivez à ${legalContact.email}, en précisant votre demande et l’adresse e-mail du compte concerné. N’envoyez pas votre mot de passe. Des informations complémentaires ne seront demandées pour vérifier votre identité qu’en cas de doute raisonnable.`,
          'Une réponse doit être apportée dans les meilleurs délais et au plus tard dans un mois à compter de la réception de la demande. Ce délai peut être prolongé de deux mois si la complexité ou le nombre de demandes le justifie ; vous devez alors être informé de cette prolongation et de ses motifs pendant le premier mois.',
          'Vous pouvez également adresser une réclamation à la CNIL. Il n’est pas nécessaire de publier vos données dans un espace de discussion public pour exercer vos droits.',
        ],
        links: [
          {
            label: 'Adresser une réclamation à la CNIL',
            href: 'https://www.cnil.fr/fr/adresser-une-plainte',
          },
        ],
      },
    ],
  },
  {
    path: '/conditions-utilisation',
    name: 'terms-of-use',
    title: 'Conditions d’utilisation',
    description:
      'Règles d’utilisation de Budgie, gestion du compte et limites des prévisions budgétaires.',
    sections: [
      {
        id: 'objet',
        title: 'Le service Budgie',
        paragraphs: [
          'Budgie est un service de suivi de budget personnel accessible sur monbudgie.fr. Vous renseignez manuellement vos comptes financiers, vos revenus et vos dépenses, ponctuels ou récurrents, pour consulter une estimation de vos soldes futurs.',
          'Budgie ne détient pas votre argent, ne se connecte pas à vos banques et n’exécute ni paiement ni virement. Les présentes conditions concernent ce service en ligne ; les conditions de la licence du code source sont distinctes.',
        ],
      },
      {
        id: 'acces-compte',
        title: 'Création et accès au compte',
        paragraphs: [
          'L’accès à votre espace nécessite un compte créé avec votre prénom, votre nom, une adresse e-mail et un mot de passe conforme aux règles du formulaire. Un compte financier principal est créé lors de l’inscription.',
          'Utilisez une adresse e-mail à laquelle vous avez accès et gardez vos identifiants confidentiels. Choisissez un mot de passe propre à Budgie, déconnectez-vous sur les appareils partagés et signalez au contact toute utilisation suspecte de votre compte.',
          'La version actuelle ne propose pas de réinitialisation autonome du mot de passe. Si vous perdez votre accès, contactez le support ; aucune récupération automatique ne peut être garantie.',
          'Le service actuel ne comporte pas de parcours de paiement actif. Toute future offre payante devra présenter ses tarifs et ses conditions avant une souscription distincte.',
        ],
      },
      {
        id: 'regles',
        title: 'Utilisation de votre espace',
        paragraphs: [
          'Vous choisissez les informations que vous saisissez et veillez à les tenir à jour. Conservez vos relevés et justificatifs personnels en dehors du service.',
          'Utilisez Budgie pour votre propre suivi budgétaire. N’accédez pas aux comptes d’autres personnes, ne tentez pas de contourner les protections du service et n’en perturbez pas le fonctionnement. Ne déposez pas de données de tiers ou d’informations confidentielles inutiles dans les champs libres.',
        ],
      },
      {
        id: 'previsions',
        title: 'Limites des prévisions',
        paragraphs: [
          'Les prévisions reposent sur les soldes, montants, dates et récurrences, ainsi que sur les taux d’intérêt et taux fiscal lorsqu’ils sont renseignés. Une opération oubliée, une information inexacte ou un événement imprévu peut modifier le solde réel. Actualisez vos prévisions après un changement.',
          'Les résultats restent indicatifs : ils ne garantissent pas un solde futur, l’absence de découvert ou la disponibilité de fonds. Ils ne remplacent pas vos relevés bancaires et ne constituent pas un conseil financier, fiscal ou d’investissement personnalisé.',
          'L’éditeur reste soumis aux responsabilités et garanties prévues par la loi. Ces explications sur les limites du service ne constituent pas une exclusion générale de responsabilité.',
        ],
      },
      {
        id: 'gestion-compte',
        title: 'Modification, déconnexion et suppression',
        paragraphs: [
          'Depuis votre profil, vous pouvez modifier votre prénom, votre nom et votre adresse e-mail. Vous pouvez aussi supprimer votre compte après confirmation. Cette suppression entraîne l’effacement des comptes financiers et des opérations associés dans la base active et met fin à l’accès à cet espace.',
          'La déconnexion retire votre jeton de connexion du navigateur ; elle laisse votre compte et les données du budget enregistrés pour une prochaine connexion. Les éventuelles conservations dans les journaux et sauvegardes sont décrites dans la politique de confidentialité et restent à préciser avant validation définitive.',
          'Si vous ne pouvez plus accéder au profil ou si vous souhaitez exercer un droit sur vos données, contactez l’éditeur par e-mail. La politique de confidentialité précise les droits et les modalités de demande.',
        ],
        links: [
          { label: 'Lire la politique de confidentialité', href: '/politique-de-confidentialite' },
        ],
      },
      {
        id: 'disponibilite',
        title: 'Disponibilité et évolutions',
        paragraphs: [
          'Des opérations de maintenance, des incidents techniques ou des difficultés de connexion peuvent interrompre temporairement le service. Aucun engagement de disponibilité continue ni de durée de rétablissement n’est annoncé.',
          'Les fonctionnalités peuvent évoluer. Les changements importants du service ou des présentes conditions devront être portés à votre connaissance avant leur application, avec une information adaptée à leur portée. Cette version de travail n’est pas présentée comme un texte contractuel définitif ni comme la preuve d’une acceptation enregistrée.',
        ],
      },
      {
        id: 'droit-contact',
        title: 'Droit applicable et réclamations',
        paragraphs: [
          'Ces conditions sont rédigées pour un service édité en France et soumis au droit français, sous réserve des règles impératives qui vous sont applicables. Elles ne limitent pas les droits et recours reconnus par la loi ni les règles de compétence juridictionnelle applicables.',
          `Pour une question, une difficulté ou une réclamation relative au service, contactez ${legalContact.name} à ${legalContact.email}.`,
        ],
      },
    ],
  },
];
