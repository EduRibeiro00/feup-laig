/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2, fixedTexture) {
		super(scene);
		this.id = id;
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.fixedTexture = fixedTexture || false;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		if(this.fixedTexture) {
			this.defaultTexCoords = [
				0, 1,
				1, 1,
				0, 0,
				1, 0
			]
		}
		else {
			this.defaultTexCoords = [
				0, this.y2 - this.y1,
				this.x2 - this.x1, this.y2 - this.y1,
				0, 0,
				this.x2 - this.x1, 0
			]
		}
		this.texCoords = this.defaultTexCoords.slice();
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

	updateTexScaleFactors(ls, lt) {
		this.texCoords = [];
		for (var i = 0; i < this.defaultTexCoords.length; i = i + 2) {
			var s = this.defaultTexCoords[i] / ls;
			var t = this.defaultTexCoords[i + 1] / lt;
			this.texCoords.push(s,t);
		}
		this.updateTexCoordsGLBuffers();
	}

	display(ls, lt) {
		if(ls != null && lt != null) {
			this.updateTexScaleFactors(ls, lt);
		}
		
		super.display();
	}

}

