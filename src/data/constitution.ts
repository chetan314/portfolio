// A small, paraphrased slice of the Constitution of India used by the
// in-browser retrieval demo. Summaries are short paraphrases, not the
// authoritative text.

export type Article = {
  id: string // normalised article number, e.g. "21A"
  title: string
  text: string
  part: string
}

export const articles: Article[] = [
  { id: '14', part: 'Part III', title: 'Equality before law', text: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.' },
  { id: '15', part: 'Part III', title: 'Prohibition of discrimination', text: 'The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex or place of birth, including access to shops, public restaurants, wells and public places.' },
  { id: '16', part: 'Part III', title: 'Equality of opportunity in public employment', text: 'There shall be equality of opportunity for all citizens in matters of employment or appointment to any office under the State, with provision for reservation of posts for backward classes.' },
  { id: '17', part: 'Part III', title: 'Abolition of untouchability', text: 'Untouchability is abolished and its practice in any form is forbidden. Enforcing any disability arising out of untouchability is an offence punishable by law.' },
  { id: '19', part: 'Part III', title: 'Protection of certain freedoms', text: 'All citizens have the right to freedom of speech and expression, to assemble peaceably without arms, to form associations or unions, to move freely and reside in any part of India, and to practise any profession, occupation, trade or business.' },
  { id: '21', part: 'Part III', title: 'Protection of life and personal liberty', text: 'No person shall be deprived of his life or personal liberty except according to procedure established by law. Courts have read privacy and dignity into this right.' },
  { id: '21A', part: 'Part III', title: 'Right to education', text: 'The State shall provide free and compulsory education to all children between the ages of six and fourteen years, in the manner the State may by law determine.' },
  { id: '22', part: 'Part III', title: 'Protection against arrest and detention', text: 'A person who is arrested must be informed of the grounds of arrest, may consult and be defended by a lawyer of their choice, and must be produced before the nearest magistrate within twenty-four hours.' },
  { id: '25', part: 'Part III', title: 'Freedom of conscience and religion', text: 'All persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion, subject to public order, morality and health.' },
  { id: '31C', part: 'Part III', title: 'Saving of laws giving effect to directive principles', text: 'A law giving effect to certain directive principles of State policy shall not be deemed void on the ground that it is inconsistent with the rights in Article 14 or Article 19.' },
  { id: '32', part: 'Part III', title: 'Remedies for enforcement of fundamental rights', text: 'The right to move the Supreme Court for enforcement of fundamental rights is guaranteed. The Supreme Court may issue writs including habeas corpus, mandamus, prohibition, quo warranto and certiorari.' },
  { id: '44', part: 'Part IV', title: 'Uniform civil code', text: 'The State shall endeavour to secure for citizens a uniform civil code throughout the territory of India, covering matters such as marriage, divorce and inheritance.' },
  { id: '51A', part: 'Part IVA', title: 'Fundamental duties', text: 'It is the duty of every citizen to abide by the Constitution, respect the national flag and anthem, protect the environment, develop scientific temper and safeguard public property.' },
  { id: '226', part: 'Part VI', title: 'Power of High Courts to issue writs', text: 'Every High Court has power to issue directions, orders or writs, including habeas corpus, mandamus, prohibition, quo warranto and certiorari, for enforcing fundamental rights and for any other purpose.' },
  { id: '243G', part: 'Part IX', title: 'Powers of Panchayats', text: 'A State may by law endow Panchayats in villages with powers and authority to function as institutions of self-government, including planning for economic development and social justice.' },
  { id: '300A', part: 'Part XII', title: 'Right to property', text: 'No person shall be deprived of his property save by authority of law. Property is a constitutional right rather than a fundamental right.' },
  { id: '356', part: 'Part XVIII', title: 'Failure of constitutional machinery in States', text: 'If the President is satisfied that the government of a State cannot be carried on in accordance with the Constitution, the President may assume the functions of the State government, commonly called President’s Rule.' },
  { id: '368', part: 'Part XX', title: 'Power of Parliament to amend the Constitution', text: 'Parliament may amend by way of addition, variation or repeal any provision of the Constitution, following the procedure of a special majority and, for some provisions, ratification by the States.' },
]
