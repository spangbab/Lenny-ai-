// A simple service to manage and play sound effects.
// NOTE: The audio files are assumed to be in the /public/sounds/ directory.

// Pre-load audio files for responsiveness.
const sounds = {
  navigate: new Audio('/sounds/navigate.mp3'),
  select: new Audio('/sounds/select.mp3'),
  submit: new Audio('/sounds/submit.mp3'),
  complete: new Audio('/sounds/complete.mp3'),
};

// Set a master volume for all sound effects to be subtle.
Object.values(sounds).forEach(sound => {
  sound.volume = 0.3;
});

/**
 * Plays a sound effect by its key name.
 * @param soundName The name of the sound to play.
 */
export const playSound = (soundName: keyof typeof sounds) => {
  const sound = sounds[soundName];
  if (sound) {
    // Rewind the sound to the start in case it's played again quickly.
    sound.currentTime = 0;
    sound.play().catch(error => {
      // Autoplay can be blocked by the browser before the first user interaction.
      // We can safely ignore this error.
      console.log(`Could not play sound '${soundName}':`, error.message);
    });
  }
};
