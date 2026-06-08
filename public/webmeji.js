// ✰ webmeji animation engine ✰

window.addEventListener('DOMContentLoaded', () => {
  const configNames = [...new Set(
    window.SPAWNING.map(spawn => spawn.config)
  )];

  const configs = configNames
    .map(name => window[name])
    .filter(Boolean);

  Promise.all(configs.map(preloadImages))
    .then(() => {
      console.log("All webmeji images loaded!");
      window.SPAWNING.forEach(({ id, config }) => {
        const cfg = window[config];
        if (!cfg) return;
        new Creature(id, cfg);
      });
    })
    .catch(error => {
      console.error("Error loading webmeji images:", error);
    });
});

function preloadImages(config) {
  const imagePaths = Object.values(config)
    .flatMap(item => (item.frames && Array.isArray(item.frames)) ? item.frames : []);

  return Promise.all(imagePaths.map(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // Gracefully resolve even if an image fails
    img.src = src;
  })));
}

class Creature {
  constructor(containerId, spriteConfig) {
    this.currentEdge = 'bottom';
    this.container = document.createElement('div');
    this.container.className = 'webmeji-container';
    document.body.appendChild(this.container);

    this.img = document.createElement('img');
    this.img.id = containerId;
    this.img.src = spriteConfig.walk.frames[0];
    this.img.setAttribute('draggable', 'false');
    this.container.appendChild(this.img);

    this.spriteConfig = spriteConfig;
    this.actionSequence = this.shuffle([...this.spriteConfig.ORIGINAL_ACTIONS]);
    this.currentActionIndex = 0;
    this.currentAction = null;
    this.frameTimer = null;
    this.dragFrameTimer = null;
    this.actionCompletionTimer = null;
    this.currentFrame = 0;
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.facing = this.direction === 1 ? 'right' : 'left';

    this.isDragging = false;
    this.isFalling = false;
    this.isPetting = false;
    this.isJumping = false;
    this.tripAfterFallActive = false;
    this.wasActionBeforePet = null; 

    this.isPointerDown = false;
    window.addEventListener('mousedown', () => { this.isPointerDown = true; });
    window.addEventListener('mouseup', () => { this.isPointerDown = false; });
    window.addEventListener('touchstart', () => { this.isPointerDown = true; }, { passive: true });
    window.addEventListener('touchend', () => { this.isPointerDown = false; });

    this.containerWidth = 100;
    this.containerHeight = 100;

    this.positionX = Math.random() * (window.innerWidth - this.containerWidth);
    this.positionY = window.innerHeight - this.containerHeight;

    this.container.style.left = `${this.positionX}px`;
    this.container.style.top = `${this.positionY}px`;

    this.maxPos = window.innerWidth - this.containerWidth;
    this.forceWalkAfter = false;
    this.forceThinkAfter = false;

    this.updateImageDirection();

    this.currentAction = this.actionSequence[this.currentActionIndex];
    this.startAction(this.currentAction);

    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.resizeHandler = () => {
      this.maxPos = Math.max(0, window.innerWidth - this.containerWidth);
      this.positionX = Math.min(this.positionX, this.maxPos);
      if (!this.isDragging && this.currentEdge === 'bottom') {
        this.positionY = window.innerHeight - this.containerHeight;
        this.container.style.top = `${this.positionY}px`;
      }
      this.container.style.left = `${this.positionX}px`;
    };
    window.addEventListener('resize', this.resizeHandler);

    this.enablePetInteraction();
    this.enableDragInteraction();
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  updateImageDirection() {
    this.img.style.transform = this.facing === 'left' ? 'scaleX(1)' : 'scaleX(-1)';
  }

  setFacingFromDelta(dx) {
    if (dx && !this.isDragging) {
      this.facing = dx < 0 ? 'left' : 'right';
      this.updateImageDirection();
    }
  }

  resetAnimation() {
    if (this.frameTimer) clearInterval(this.frameTimer);
    if (this.actionCompletionTimer) clearTimeout(this.actionCompletionTimer);
    this.currentFrame = 0;
    this.frameTimer = null;
    this.actionCompletionTimer = null;
  }

  clearAllTimers() {
    this.resetAnimation();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isSideEdge(edge) { return edge === 'left' || edge === 'right'; }
  isNonBottomEdge(edge) { return edge !== 'bottom'; }

  updateEdgeClass() {
    this.container.classList.remove('edge-left','edge-right','edge-top');
    if (!this.isDragging) {
      if (this.currentEdge === 'left') this.container.classList.add('edge-left');
      if (this.currentEdge === 'right') this.container.classList.add('edge-right');
      if (this.currentEdge === 'top') this.container.classList.add('edge-top');
    }
    this.applyEdgeOffset();
  }

  applyEdgeOffset() {
    if (this.isDragging) {
      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;
      return;
    }
    const offsetX = this.currentEdge === 'left' ? -this.containerWidth/2 :
                    this.currentEdge === 'right' ? this.containerHeight/2 : 0;
    const offsetY = this.currentEdge === 'top' ? -this.containerHeight/2 : 0;

    this.container.style.left = `${(this.positionX || 0) + offsetX}px`;
    this.container.style.top  = `${(this.positionY || 0) + offsetY}px`;
  }

  jumpToEdge(targetEdge) {
    if (this.isFalling || this.isPetting || this.isDragging || this.isJumping) return;
    if (!this.spriteConfig.ALLOWANCES.includes(targetEdge)) return;

    this.isJumping = true;
    this.resetAnimation();

    const jumpConfig = this.spriteConfig.jump;
    if (!jumpConfig) { this.isJumping = false; return; }

    const startX = this.positionX;
    const startY = this.positionY;
    let endX = startX;
    let endY = startY;

    switch (targetEdge) {
      case 'top':
        endY = 0;
        endX = Math.random() * (window.innerWidth - this.containerWidth);
        break;
      case 'left':
        endX = 0;
        endY = Math.random() * (window.innerHeight - this.containerHeight);
        break;
      case 'right':
        endX = window.innerWidth - this.containerWidth;
        endY = Math.random() * (window.innerHeight - this.containerHeight);
        break;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) { this.isJumping = false; return; }

    const duration = distance / this.spriteConfig.jumpspeed;
    const startTime = performance.now();

    let frameIndex = 0;
    const totalFrames = jumpConfig.frames.length;
    this.img.src = jumpConfig.frames[frameIndex];

    const frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % totalFrames;
      this.img.src = jumpConfig.frames[frameIndex];
    }, jumpConfig.interval);

    const step = (time) => {
      if (this.isDragging) {
        clearInterval(frameTimer); 
        this.isJumping = false;    
        return;                    
      }

      const elapsed = (time - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);

      this.positionX = startX + dx * t;
      this.positionY = startY + dy * t;

      if (dx !== 0) this.setFacingFromDelta(dx);

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top = `${this.positionY}px`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearInterval(frameTimer); 
        this.isJumping = false;
        this.currentEdge = targetEdge;
        this.updateEdgeClass();
        this.startEdgeIdle();
      }
    };
    requestAnimationFrame(step);
  }

  startEdgeIdle() {
    this.updateEdgeClass();
    if (this.currentEdge === 'top') this.startAction('hangstillTop');
    else if (this.isSideEdge(this.currentEdge)) this.startAction('hangstillSide');
  }

  edgeAction() {
    if (this.isJumping || this.isFalling) return;
    const choice = this.spriteConfig.EDGE_ACTIONS[Math.floor(Math.random() * this.spriteConfig.EDGE_ACTIONS.length)];
    if (choice === 'hang') this.startEdgeIdle();
    else if (choice === 'climb') this.startAction(this.currentEdge === 'top' ? 'climbTop' : 'climbSide');
    else if (choice === 'fall') this.fallToBottom();
  }

  enablePetInteraction() {
    if (!this.spriteConfig.ALLOWANCES?.includes('pet') || !this.spriteConfig.ALLOWANCES?.includes('bottom')) return;

    this.container.addEventListener('mouseenter', () => {
      if (this.isFalling || this.isPointerDown || this.isPetting || this.isJumping || this.currentEdge !== 'bottom') return;
      this.isPetting = true;
      this.wasActionBeforePet = this.currentAction;
      this.startPetAnimation();
    });
    this.container.addEventListener('mouseleave', () => {
      if (this.isFalling || this.isPointerDown || this.isJumping || this.currentEdge === 'top') return;
      this.isPetting = false;
      this.stopPetAnimation();
    });
  }

  enableDragInteraction() {
    if (!this.spriteConfig.ALLOWANCES?.includes('drag') || !this.spriteConfig.ALLOWANCES?.includes('bottom')) return;

    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const onPointerMove = (e) => {
      e.preventDefault();
      const clientX = e.clientX ?? e.touches?.[0].clientX;
      const clientY = e.clientY ?? e.touches?.[0].clientY;

      this.positionX = clientX - dragOffsetX;
      this.positionY = clientY - dragOffsetY;

      this.positionX = Math.max(0, Math.min(this.positionX, window.innerWidth - this.containerWidth));
      this.positionY = Math.max(0, Math.min(this.positionY, window.innerHeight - this.containerHeight));

      this.container.style.left = `${this.positionX}px`;
      this.container.style.top  = `${this.positionY}px`;
    };

    const onPointerUp = () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      this.isDragging = false;
      this.isFalling = false;
      if (this.dragFrameTimer) {
        clearInterval(this.dragFrameTimer);
        this.dragFrameTimer = null;
      }
      this.resetAnimation();
      this.fallToBottom();
      this.animationFrameId = requestAnimationFrame(this.animate);
    };

    const startDragHandler = (clientX, clientY) => {
      this.resetAnimation();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      this.isDragging = true;
      this.tripAfterFallActive = false;
      this.isJumping = false;
      this.isFalling = false;
      this.isPetting = false;

      this.currentAction = 'drag';
      this.img.style.transform = this.facing === 'left' ? 'scaleX(1)' : 'scaleX(-1)';

      if (this.dragFrameTimer) clearInterval(this.dragFrameTimer);

      const dragConfig = this.spriteConfig.drag;
      if (dragConfig?.frames?.length) {
        let frame = 0;
        this.img.src = dragConfig.frames[0];
        this.dragFrameTimer = setInterval(() => {
          frame = (frame + 1) % dragConfig.frames.length;
          this.img.src = dragConfig.frames[frame];
        }, dragConfig.interval);
      }

      const rect = this.container.getBoundingClientRect();
      dragOffsetX = clientX - rect.left;
      dragOffsetY = clientY - rect.top;

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);
    };

    this.container.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      startDragHandler(e.clientX, e.clientY);
    });

    this.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      startDragHandler(touch.clientX, touch.clientY);
    }, { passive: false });
  }

  fallToBottom(fallSpeed = this.spriteConfig.fallspeed) {
    if (this.isFalling) return;
    this.tripAfterFallActive = false;
    this.isFalling = true;
    this.currentEdge = 'bottom';
    this.updateEdgeClass();
    this.resetAnimation();

    const cfg = this.spriteConfig.falling;
    if (!cfg) return;

    let frameIndex = 0;
    this.img.src = cfg.frames[0];
    this.frameTimer = setInterval(() => { 
      frameIndex = (frameIndex + 1) % cfg.frames.length; 
      this.img.src = cfg.frames[frameIndex]; 
    }, cfg.interval);

    const startY = this.positionY;
    const endY = window.innerHeight - this.containerHeight;
    const distance = endY - startY;

    if (distance <= 0) { 
      clearInterval(this.frameTimer); 
      this.frameTimer = null; 
      this.positionY = endY; 
      this.container.style.top = `${endY}px`; 
      return this.playTripAfterFall(); 
    }

    const startTime = performance.now();
    const step = (time) => {
      if (this.isDragging) {
        clearInterval(this.frameTimer);
        this.frameTimer = null;
        return this.animationFrameId = requestAnimationFrame(this.animate);
      }

      const elapsed = (time - startTime) / 1000;
      const deltaY = fallSpeed * elapsed;
      this.positionY = Math.min(startY + deltaY, endY);
      this.container.style.top = `${this.positionY}px`;

      if (this.positionY < endY) {
        requestAnimationFrame(step);
      } else {
        clearInterval(this.frameTimer);
        this.frameTimer = null;
        this.positionY = endY;
        this.container.style.top = `${endY}px`;
        this.playTripAfterFall();
      }
    };
    requestAnimationFrame(step);
  }

  playTripAfterFall() {
    const tripConfig = this.spriteConfig.fallen;
    if (!tripConfig) {
      this.resumeAfterFallen();
      return;
    }

    this.tripAfterFallActive = true;
    let frame = 0;
    const totalFrames = tripConfig.frames.length;
    this.img.src = tripConfig.frames[0];

    const frameTimer = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        clearInterval(frameTimer);
        this.img.src = tripConfig.frames[totalFrames - 1];
        setTimeout(() => {
          if (this.tripAfterFallActive) this.resumeAfterFallen();
        }, this.spriteConfig.gettingupspeed);
      } else {
        this.img.src = tripConfig.frames[frame];
      }
    }, tripConfig.interval);
  }

  resumeAfterFallen() {
    if (this.isDragging) return;
    this.isFalling = false;
    this.isPetting = false;
    this.resetAnimation();
    this.lastTime = performance.now();
    this.currentAction = 'sit';
    this.setNextAction();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  setNextAction() {
    if (this.isDragging || this.isFalling) return;
    this.resetAnimation();

    if (['top', 'left', 'right'].includes(this.currentEdge)) {
      this.edgeAction();
      return;
    }

    if (!this.isJumping && this.positionY >= window.innerHeight - this.containerHeight) {
      if (Math.random() < this.spriteConfig.JUMP_CHANCE) {
        const edges = ['top', 'left', 'right'].filter(e => this.spriteConfig.ALLOWANCES.includes(e));
        if (edges.length) {
          const target = edges[Math.floor(Math.random() * edges.length)];
          this.jumpToEdge(target);
          return;
        }
      }
    }

    if (this.forceWalkAfter) {
      this.forceWalkAfter = false;
      this.startForcedWalk();
      return;
    }

    if (this.forceThinkAfter) {
      this.forceThinkAfter = false;
      this.startForceThink();
      return;
    }

    this.currentActionIndex++;
    if (this.currentActionIndex >= this.actionSequence.length) {
      this.currentActionIndex = 0;
      this.actionSequence = this.shuffle([...this.spriteConfig.ORIGINAL_ACTIONS]);
    }

    this.currentAction = this.actionSequence[this.currentActionIndex];
    this.startAction(this.currentAction);
  }

  startForcedWalk() {
    const { frames, interval } = this.spriteConfig.walk;
    const walkCycles = this.spriteConfig.forcewalk.loops || 6;
    this.currentAction = 'forced-walk';
    this.playAnimation(frames, interval, walkCycles, () => this.setNextAction());
  }

  startForceThink() {
    const { frames, interval, loops } = this.spriteConfig.forcethink;
    this.currentAction = 'force-think';
    this.playAnimation(frames, interval, loops, () => this.setNextAction());
  }

  startPetAnimation() {
    this.resetAnimation();
    const petConfig = this.spriteConfig.pet;
    if (!petConfig) return;

    this.currentAction = 'pet';
    let frame = 0;
    this.img.src = petConfig.frames[0];

    this.frameTimer = setInterval(() => {
      frame = (frame + 1) % petConfig.frames.length;
      this.img.src = petConfig.frames[frame];
    }, petConfig.interval);
  }

  stopPetAnimation() {
    this.resetAnimation();
    this.currentAction = this.wasActionBeforePet || 'sit';
    this.wasActionBeforePet = null;
    this.setNextAction();
  }

  startAction(action) {  
    if (this.isDragging || this.isFalling) return;
    this.currentAction = action;
    this.resetAnimation();

    if (action === 'climbTop' || action === 'climbSide') {
      this.direction = Math.random() < 0.5 ? -1 : 1;
      if (action === 'climbTop') this.updateImageDirection();
    }
    if (this.isJumping) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    const config = this.spriteConfig[action];
    if (!config) return;

    const { frames, interval, loops = 1 } = config;

    if (action === 'sit' || action === 'hangstillSide' || action === 'hangstillTop') {
      const duration = config.randomizeDuration
        ? Math.random() * (config.max - config.min) + config.min
        : interval * loops;
      this.img.src = frames[0];
      this.actionCompletionTimer = setTimeout(() => {
        this.forceWalkAfter = true;
        this.setNextAction();
      }, duration);
      return;
    }

    this.playAnimation(frames, interval, loops, () => {
      if (action === 'spin') {
        this.direction *= -1;
        this.facing = this.facing === 'left' ? 'right' : 'left';
        this.updateImageDirection();
      }
      if (['trip', 'spin'].includes(action)) this.forceWalkAfter = true;
      if (action === 'dance') this.forceThinkAfter = true;
      this.setNextAction();
    });
  }

  playAnimation(frames, interval, loops, onComplete) {
    let playCount = 0;
    let f = 0;
    this.currentFrame = 0;
    this.img.src = frames[0];
    if (this.frameTimer) clearInterval(this.frameTimer);

    this.frameTimer = setInterval(() => {
      this.currentFrame = f = (f + 1) % frames.length;
      this.img.src = frames[f];
      if (f === frames.length - 1 && ++playCount >= loops) {
        clearInterval(this.frameTimer);
        this.frameTimer = null;
        this.currentAction = null;
        this.actionCompletionTimer = setTimeout(onComplete, 0);
      }
    }, interval);
  }

  animate(time) {
    if (!this.lastTime) this.lastTime = time;
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    if (this.isDragging || this.isFalling) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    const movingActions = ['walk', 'forced-walk', 'climbTop'];
    if (movingActions.includes(this.currentAction)) {
      const dx = this.direction * this.spriteConfig.walkspeed * delta;
      this.positionX += dx;
      this.setFacingFromDelta(dx);

      if (this.positionX <= 0) {
        this.positionX = 0;
        this.direction = 1;
        this.facing = 'right';
        this.updateImageDirection();
      } else if (this.positionX >= this.maxPos) {
        this.positionX = this.maxPos;
        this.direction = -1;
        this.facing = 'left';
        this.updateImageDirection();
      }
      this.applyEdgeOffset();
    }

    if (this.currentAction === 'climbSide') {
      this.positionY += this.direction * this.spriteConfig.walkspeed * delta;
      if (this.currentEdge === 'left') this.facing = 'left';
      else if (this.currentEdge === 'right') this.facing = 'right';
      this.updateImageDirection();

      const maxY = window.innerHeight - this.containerHeight;
      if (this.positionY <= 0) {
        this.positionY = 0;
        this.direction = 1;
      } else if (this.positionY >= maxY) {
        this.positionY = maxY;
        this.direction = -1;
      }
      this.applyEdgeOffset();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
